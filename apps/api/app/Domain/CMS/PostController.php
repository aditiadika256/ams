<?php

namespace App\Domain\CMS;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="CMS - Posts",
 *     description="Content Management System - Post Management"
 * )
 */
class PostController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/cms/posts",
     *     tags={"CMS - Posts"},
     *     summary="List all posts",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="page", in="query", description="Page number", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="limit", in="query", description="Items per page", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="status", in="query", description="Filter by status", required=false, @OA\Schema(type="string", enum={"draft", "published", "archived"})),
     *     @OA\Response(response=200, description="List of posts")
     * )
     */
    public function index(Request $request)
    {
        $query = Post::query();

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

        $posts = $query->latest()
            ->paginate($this->getLimit($request));

        return $this->paginatedResponse($posts, 'Posts retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cms/posts",
     *     tags={"CMS - Posts"},
     *     summary="Create a new post",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "content"},
     *             @OA\Property(property="title", type="string", example="My First Post"),
     *             @OA\Property(property="content", type="string", example="<p>This is the content</p>"),
     *             @OA\Property(property="excerpt", type="string", example="Short summary"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published", "archived"}, default="draft"),
     *             @OA\Property(property="featured_image", type="string", format="url", nullable=true),
     *             @OA\Property(property="published_at", type="string", format="date-time", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Post created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
            'featured_image' => 'nullable|string',
            'published_at' => 'nullable|date',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        
        $post = Post::create($validated);

        return $this->successResponse($post, 'Post created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/cms/posts/{id}",
     *     tags={"CMS - Posts"},
     *     summary="Get post details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Post details"),
     *     @OA\Response(response=404, description="Post not found")
     * )
     */
    public function show($id)
    {
        $post = Post::findOrFail($id);
        return $this->successResponse($post, 'Post details retrieved successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/cms/posts/{id}",
     *     tags={"CMS - Posts"},
     *     summary="Update a post",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="content", type="string"),
     *             @OA\Property(property="excerpt", type="string"),
     *             @OA\Property(property="status", type="string", enum={"draft", "published", "archived"}),
     *             @OA\Property(property="featured_image", type="string"),
     *             @OA\Property(property="published_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Post updated successfully"),
     *     @OA\Response(response=404, description="Post not found")
     * )
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,archived',
            'featured_image' => 'nullable|string',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        $post->update($validated);

        return $this->successResponse($post, 'Post updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cms/posts/{id}",
     *     tags={"CMS - Posts"},
     *     summary="Delete a post",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Post deleted successfully"),
     *     @OA\Response(response=404, description="Post not found")
     * )
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return $this->successResponse(null, 'Post deleted successfully');
    }
}
