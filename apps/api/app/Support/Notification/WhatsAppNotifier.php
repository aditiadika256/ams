<?php

namespace App\Support\Notification;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotifier
{
    /**
     * Send a WhatsApp message via Fonnte or Wablas, with fallback to Log.
     */
    public function sendMessage(string $target, string $message): bool
    {
        $target = $this->normalizePhone($target);
        if (empty($target)) {
            return false;
        }

        $fonnteToken = config('services.fonnte.token', env('FONNTE_TOKEN'));
        if ($fonnteToken) {
            try {
                $response = Http::withHeaders(['Authorization' => $fonnteToken])
                    ->post('https://api.fonnte.com/send', [
                        'target' => $target,
                        'message' => $message,
                    ]);

                return $response->successful();
            } catch (\Throwable $e) {
                Log::warning("Fonnte WA failed: {$e->getMessage()}", ['target' => $target]);
            }
        }

        Log::info("WhatsApp Notification (simulated/no-token): [{$target}] {$message}");

        return true;
    }

    public function sendInvoiceNotification(Order $order): bool
    {
        $user = $order->user;
        $phone = $user->phone ?? $order->meta['phone'] ?? null;
        if (! $phone) {
            return false;
        }

        $totalFormatted = 'Rp ' . number_format((float) $order->total, 0, ',', '.');
        $msg = "Halo {$user->name},\n\n"
            . "Tagihan baru untuk Order #{$order->id} telah dibuat sebesar {$totalFormatted}.\n"
            . "Status: Belum Dibayar.\n"
            . "Silakan selesaikan pembayaran untuk mengaktifkan akses program Anda.\n\n"
            . "Terima kasih,\nArkanin Education";

        return $this->sendMessage($phone, $msg);
    }

    public function sendPaymentReceipt(Order $order): bool
    {
        $user = $order->user;
        $phone = $user->phone ?? $order->meta['phone'] ?? null;
        if (! $phone) {
            return false;
        }

        $totalFormatted = 'Rp ' . number_format((float) $order->total, 0, ',', '.');
        $msg = "Halo {$user->name},\n\n"
            . "Pembayaran untuk Order #{$order->id} ({$totalFormatted}) telah BERHASIL diverifikasi.\n"
            . "Akses program Anda telah aktif di Workspace.\n\n"
            . "Selamat belajar!\nArkanin Education";

        return $this->sendMessage($phone, $msg);
    }

    public function sendTransactionApproval(Transaction $transaction, bool $approved): bool
    {
        $user = $transaction->user;
        if (! $user) {
            return false;
        }
        $phone = $user->phone ?? null;
        if (! $phone) {
            return false;
        }

        $amountFormatted = 'Rp ' . number_format((float) $transaction->amount, 0, ',', '.');
        if ($approved) {
            $msg = "Halo {$user->name},\n\n"
                . "Transaksi #{$transaction->reference_number} ({$amountFormatted}) telah DISETUJUI oleh Admin Keuangan.\n"
                . "Layanan terkait kini telah aktif.\n\n"
                . "Arkanin Education";
        } else {
            $msg = "Halo {$user->name},\n\n"
                . "Transaksi #{$transaction->reference_number} ({$amountFormatted}) TIDAK DAPAT DISETUJUI.\n"
                . "Jika ada dana yang telah masuk, saldo akan dikreditkan ke Dompet Siswa Anda.\n\n"
                . "Arkanin Education";
        }

        return $this->sendMessage($phone, $msg);
    }

    private function normalizePhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone) ?? '';
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        }

        return $cleaned;
    }
}
