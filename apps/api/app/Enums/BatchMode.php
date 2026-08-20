<?php

namespace App\Enums;

enum BatchMode: string
{
    case Online = 'ONLINE';
    case Offline = 'OFFLINE';
    case Hybrid = 'HYBRID';
}
