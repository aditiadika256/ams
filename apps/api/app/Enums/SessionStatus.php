<?php

namespace App\Enums;

enum SessionStatus: string
{
    case Draft = 'DRAFT';
    case Scheduled = 'SCHEDULED';
    case Ongoing = 'ONGOING';
    case Completed = 'COMPLETED';
    case Cancelled = 'CANCELLED';
}
