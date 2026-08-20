<?php

namespace App\Domain\Access;

use App\Actions\Access\RedeemAccessCode;
use App\Enums\CodeType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\CodeRedemptionRequest;
use App\Http\Resources\ProgramAccessResource;
use Illuminate\Http\JsonResponse;

class CodeRedemptionController extends Controller
{
    public function voucher(CodeRedemptionRequest $request, RedeemAccessCode $action): JsonResponse
    {
        return $this->redeem($request, $action, CodeType::Voucher);
    }

    public function enrollment(CodeRedemptionRequest $request, RedeemAccessCode $action): JsonResponse
    {
        return $this->redeem($request, $action, CodeType::EnrollmentCode);
    }

    private function redeem(
        CodeRedemptionRequest $request,
        RedeemAccessCode $action,
        CodeType $type,
    ): JsonResponse {
        $data = $request->validated();
        [$access, $wasExisting] = $action->handle(
            $request->user(),
            $data['code'],
            $data['idempotency_key'],
            $type,
        );

        return $wasExisting
            ? $this->successResponse(new ProgramAccessResource($access), 'Code already redeemed')
            : $this->createdResponse(new ProgramAccessResource($access), 'Code redeemed successfully');
    }
}
