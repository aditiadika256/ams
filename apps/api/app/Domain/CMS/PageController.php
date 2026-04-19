<?php

namespace App\Domain\CMS;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="CMS - Pages",
 *     description="Content Management System - Page Management"
 * )
 */
class PageController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/cms/pages",
     *     tags={"CMS - Pages"},
     *     summary="List all pages",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="page", in="query", description="Page number", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="limit", in="query", description="Items per page", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="status", in="query", description="Filter by status", required=false, @OA\Schema(type="string", enum={"draft", "published"})),
     *     @OA\Response(response=200, description="List of pages")
     * )
     */
    public function index(Request $request)
    {
        $query = Page::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $pages = $query->latest()
            ->paginate($this->getLimit($request));

        return $this->paginatedResponse($pages, 'Pages retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cms/pages",
     *     tags={"CMS - Pages"},
     *     summary="Create a new page",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "content"},
     *             @OA\Property(property="title", type="string", example="About Us"),
     *             @OA\Property(property="content", type="string", example="<p>About us content</p>"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published"}, default="draft"),
     *             @OA\Property(property="meta_title", type="string", nullable=true),
     *             @OA\Property(property="meta_description", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Page created successfully")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'nullable|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        
        // Ensure unique slug
        if (Page::where('slug', $validated['slug'])->exists()) {
             $validated['slug'] .= '-' . Str::random(6);
        }
        
        $page = Page::create($validated);

        return $this->successResponse($page, 'Page created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/cms/pages/{id}",
     *     tags={"CMS - Pages"},
     *     summary="Get page details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Page details")
     * )
     */
    public function show($id)
    {
        $page = Page::findOrFail($id);
        return $this->successResponse($page, 'Page details retrieved successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/cms/pages/{id}",
     *     tags={"CMS - Pages"},
     *     summary="Update a page",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="content", type="string"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published"}),
     *             @OA\Property(property="meta_title", type="string"),
     *             @OA\Property(property="meta_description", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Page updated successfully")
     * )
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure unique slug excluding current
             if (Page::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                 $validated['slug'] .= '-' . Str::random(6);
            }
        }

        $page->update($validated);

        return $this->successResponse($page, 'Page updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cms/pages/{id}",
     *     tags={"CMS - Pages"},
     *     summary="Delete a page",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Page deleted successfully")
     * )
     */
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return $this->successResponse(null, 'Page deleted successfully');
    }
}
