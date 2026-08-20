<?php

namespace App\Actions\Programs;

use App\Exceptions\ProgramReferencedException;
use App\Models\Program;
use Illuminate\Support\Facades\DB;

class DeleteProgram
{
    public function __construct(private readonly RotateProgramCatalogCache $rotateCache) {}

    public function handle(Program $program): void
    {
        DB::transaction(function () use ($program): void {
            $locked = Program::query()->lockForUpdate()->findOrFail($program->id);

            if (
                $locked->orderItems()->exists()
                || $locked->accesses()->exists()
                || $locked->batches()->exists()
                || $locked->incomingRelations()->exists()
            ) {
                throw new ProgramReferencedException;
            }

            $locked->delete();
        });

        $this->rotateCache->handle();
    }
}
