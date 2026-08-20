<?php

namespace App\Enums;

enum AccessSource: string
{
    case Payment = 'PAYMENT';
    case Voucher = 'VOUCHER';
    case EnrollmentCode = 'ENROLLMENT_CODE';
    case AdminGrant = 'ADMIN_GRANT';
    case Collection = 'COLLECTION';
    case FreeEnrollment = 'FREE_ENROLLMENT';
}
