<?php

namespace App\Enums;

enum ProgramStatus: string
{
    case Draft = 'DRAFT';
    case Published = 'PUBLISHED';
    case Unpublished = 'UNPUBLISHED';
    case Archived = 'ARCHIVED';
}
