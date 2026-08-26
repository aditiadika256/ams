<?php

namespace App\Enums;

enum MentorAssignmentMode: string
{
    case Admin = 'ADMIN';
    case Student = 'STUDENT';
    case Hybrid = 'HYBRID';
}
