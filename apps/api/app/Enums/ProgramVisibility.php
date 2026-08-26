<?php

namespace App\Enums;

enum ProgramVisibility: string
{
    case Public = 'PUBLIC';
    case Unlisted = 'UNLISTED';
    case Private = 'PRIVATE';
}
