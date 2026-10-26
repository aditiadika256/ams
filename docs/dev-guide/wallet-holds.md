# Developer Guide: Wallet Holds (Finance)
# Arkanin Management System (AMS)

Panduan teknis dan arsitektur pengembangan untuk modul **Wallet Holds & Escrow Protection**.

---

## 1. Skema Database & Relasi Eloquent

Tabel: `wallet_holds`
- `user_id`: Relasi ke `users(id)`.
- `wallet_id`: Relasi ke `wallets(id)`.
- `amount`: Nominal dana tertahan.
- `reason`: Alasan penahanan saldo.
- `release_condition`: Persyaratan pelepasan otomatis/manual.
- `status`: Enum string (`held`, `released`, `forfeited`).
- `released_at`: Waktu penyelesaian hold.
- Kolom Audit Wajib: `created_at`, `created_by`, `updated_at`, `updated_by`, dan `row_status` dikelola melalui `App\Traits\UserStamps`.

---

## 2. Atomic Balance Mutator (Database Transaction)

Operasi penahanan dan pelepasan saldo dieksekusi di dalam `DB::transaction()` untuk mencegah inkonsistensi saldo (*double-spending* atau *phantom balance*):

```php
DB::transaction(function () use ($wallet, $amount, $validated) {
    // Kurangi saldo cair, tambah pending balance
    $wallet->balance -= $amount;
    $wallet->pending_balance += $amount;
    $wallet->save();

    WalletHold::create([
        'user_id' => $validated['user_id'],
        'wallet_id' => $wallet->id,
        'amount' => $amount,
        'reason' => $validated['reason'],
        'status' => 'held',
        'row_status' => 1,
    ]);
});
```
