# Dokumentasi API: Wallet Holds (Finance)

Spesifikasi endpoint backend untuk penahanan saldo sementara (*Hold Balance*), rekonsiliasi dispute klaim garansi, dan pelepasan dana (*Release/Forfeit*).

---

## 1. Wallet Holds (`/api/v1/finance/holds`)

### 1.1 List Wallet Holds
Mengambil daftar catatan saldo tertahan (*hold balance*).

- **URL**: `GET /api/v1/finance/holds`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `view_finance_analytics` | `manage_global_settings`
- **Query Parameters**:
  - `status` (string, opsional): `all`, `held`, `released`, `forfeited`.
  - `search` (string, opsional): Pencarian nama siswa atau alasan hold.
  - `page` (integer, default: 1).
  - `per_page` (integer, default: 15).

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Wallet holds retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 15,
      "wallet_id": 8,
      "amount": "250000.00",
      "reason": "Penahanan saldo garansi refund program",
      "release_condition": "Siswa menyelesaikan 80% modul atau 14 hari tanpa dispute",
      "status": "held",
      "released_at": null,
      "row_status": 1,
      "user": {
        "id": 15,
        "name": "Sarah Oktaviani",
        "email": "sarah@gmail.com"
      },
      "wallet": {
        "id": 8,
        "balance": "750000.00",
        "pending_balance": "250000.00"
      },
      "created_at": "2026-10-26T12:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

### 1.2 Create Wallet Hold
Menahan saldo dompet siswa (mengurangi `balance` dan menambah `pending_balance`).

- **URL**: `POST /api/v1/finance/holds`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "user_id": 15,
  "amount": 250000,
  "reason": "Penahanan saldo garansi refund program",
  "release_condition": "Siswa menyelesaikan 80% modul atau 14 hari tanpa dispute"
}
```

**Contoh Response `201 Created`**:
```json
{
  "success": true,
  "message": "Funds held successfully",
  "data": {
    "id": 1,
    "amount": "250000.00",
    "status": "held"
  }
}
```

---

### 1.3 Release Held Funds
Mengembalikan saldo tertahan ke saldo aktif dompet siswa.

- **URL**: `POST /api/v1/finance/holds/{id}/release`
- **Authentication**: `Bearer Token` (Sanctum)

---

### 1.4 Forfeit Held Funds
Mendebit saldo tertahan secara permanen akibat hasil keputusan dispute / klaim ganti rugi.

- **URL**: `POST /api/v1/finance/holds/{id}/forfeit`
- **Authentication**: `Bearer Token` (Sanctum)
