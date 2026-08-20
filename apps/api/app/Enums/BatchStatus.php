<?php

namespace App\Enums;

enum BatchStatus: string
{
    case Draft = 'DRAFT';
    case Open = 'OPEN';
    case Running = 'RUNNING';
    case Completed = 'COMPLETED';
    case Cancelled = 'CANCELLED';
}
