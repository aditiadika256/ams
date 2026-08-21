<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class WorkspaceAccessDetailResource extends WorkspaceAccessResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $program = $this->whenLoaded('program');

        $data['program']['description'] = $program?->description;
        $data['components'] = $program?->components->map(fn ($component): array => [
            'code' => $component->definition->code,
            'name' => $component->definition->name,
            'label' => $component->label,
            'sort_order' => $component->sort_order,
        ])->values() ?? [];

        if ($data['next_session'] !== null) {
            $data['next_session']['meeting_url'] = $this->nextSession->meeting_url;
            $data['next_session']['mentor_assignments'] = SessionMentorAssignmentResource::collection(
                $this->nextSession->mentorAssignments
            );
        }

        return $data;
    }
}
