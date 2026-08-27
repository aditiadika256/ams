<?php

namespace App\Actions\Components;

use App\Actions\Audit\RecordDomainAudit;
use App\Exceptions\DomainConflictException;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteMediaAsset
{
    public function __construct(private readonly RecordDomainAudit $audit) {}

    public function handle(MediaAsset $mediaAsset, User $actor, string $reason): void
    {
        DB::transaction(function () use ($mediaAsset, $actor, $reason): void {
            $asset = MediaAsset::query()->lockForUpdate()->findOrFail($mediaAsset->id);

            if ($asset->contents()->withTrashed()->exists() || $asset->lessons()->exists()) {
                throw new DomainConflictException(
                    'MEDIA_ASSET_REFERENCED',
                    'File masih digunakan oleh isi Program dan tidak dapat dihapus.',
                    ['media_asset_id' => $asset->id],
                );
            }

            $before = $asset->getAttributes();
            $asset->delete();
            $this->audit->handle(
                $asset,
                'media_asset.archived',
                $actor,
                $reason,
                $before,
                $asset->getAttributes(),
            );
        });
    }
}
