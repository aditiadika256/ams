<?php

namespace App\Enums;

enum SessionMode: string
{
    case Online = 'ONLINE';
    case Offline = 'OFFLINE';
    case Hybrid = 'HYBRID';
}
