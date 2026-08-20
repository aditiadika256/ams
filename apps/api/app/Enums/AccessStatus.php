<?php

namespace App\Enums;

enum AccessStatus: string
{
    case Waiting = 'WAITING';
    case Active = 'ACTIVE';
    case Completed = 'COMPLETED';
    case Expired = 'EXPIRED';
    case Suspended = 'SUSPENDED';
    case Revoked = 'REVOKED';
}
