# API Documentation – Auth, Programs, Orders

Dokumentasi ini menjelaskan endpoint utama yang sudah diimplementasikan di Laravel API:

- Auth (login, me, logout)
- Programs (produk bimbel/tryout)
- Orders (transaksi pembelian program)

Contoh di bawah ini bisa langsung dipakai di Postman.

## Base URL dan Header

- Base URL API (lokal, via Docker Compose):

  ```text
  http://localhost:8000/api/v1
  ```

- Header umum untuk semua request JSON:

  ```text
  Content-Type: application/json
  Accept: application/json
  ```

- Untuk endpoint yang membutuhkan login:

  ```text
  Authorization: Bearer <token_dari_login>
  ```

## 1. Auth

### 1.1 Login

- Method: `POST`
- URL: `/auth/login`
- Auth: tidak perlu token

**Request body (raw JSON):**

```json
{
  "email": "superadmin@example.com",
  "password": "password"
}
```

**Response sukses (contoh):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@example.com",
      "roles": ["superadmin"],
      "permissions": []
    },
    "token": "1|abc123..."
  }
}
```

Nilai `token` di atas digunakan untuk header:

```text
Authorization: Bearer 1|abc123...
```

### 1.2 Me (profil user login)

- Method: `GET`
- URL: `/auth/me`
- Auth: `Bearer <token>`
- Body: kosong

**Contoh hit di Postman:**

- URL: `{{base_url}}/auth/me`
- Header:

  ```text
  Authorization: Bearer {{token}}
  ```

### 1.3 Logout

- Method: `POST`
- URL: `/auth/logout`
- Auth: `Bearer <token>`
- Body: kosong

**Contoh hit di Postman:**

- URL: `{{base_url}}/auth/logout`
- Header:

  ```text
  Authorization: Bearer {{token}}
  ```

Setelah logout, token yang digunakan tidak valid lagi.

## 2. Programs

Program = produk bimbel/tryout yang bisa dibeli user.

### 2.1 List Programs

- Method: `GET`
- URL: `/programs`
- Auth: optional (saat ini tidak wajib login)

**Query params (opsional):**

- `level`: `sd | smp | sma | cpns`
- `type`: `tryout | bimbel`
- `active`: `true | false`
- `search`: string, cari di nama program
- `sort_by`: `name | price | created_at`
- `sort_dir`: `asc | desc`
- `page`: integer
- `per_page`: integer (1–100, default 15)

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/programs?level=sma&type=tryout&active=true&search=UTBK&sort_by=price&sort_dir=asc&page=1&per_page=10
  ```

- Body: kosong

**Contoh response (ringkas):**

```json
{
  "success": true,
  "message": "Programs retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Paket Tryout UTBK Saintek",
      "level": "sma",
      "type": "tryout",
      "price": 250000,
      "active": true,
      "created_at": "2025-10-29T10:00:00Z",
      "updated_at": "2025-10-29T10:00:00Z"
    }
  ]
}
```

### 2.2 Detail Program

- Method: `GET`
- URL: `/programs/{id}`
- Auth: optional

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/programs/1
  ```

- Body: kosong

### 2.3 Create Program (Admin)

- Method: `POST`
- URL: `/programs`
- Auth: `Bearer <token>` (sebaiknya token admin)

**Request body (raw JSON):**

```json
{
  "name": "Paket Tryout UTBK Saintek",
  "level": "sma",
  "type": "tryout",
  "price": 250000,
  "active": true
}
```

Field:

- `name`: required, string
- `level`: required, `sd|smp|sma|cpns`
- `type`: required, `tryout|bimbel`
- `price`: required, integer, minimal 0
- `active`: optional, boolean (default `true` jika tidak dikirim)

### 2.4 Update Program (Admin)

- Method: `PUT`
- URL: `/programs/{id}`
- Auth: `Bearer <token>`

Semua field opsional (boleh kirim sebagian saja).

**Request body (raw JSON, contoh):**

```json
{
  "name": "Paket Tryout UTBK Saintek - Revisi",
  "price": 275000,
  "active": true
}
```

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/programs/1
  ```

### 2.5 Delete Program (Admin)

- Method: `DELETE`
- URL: `/programs/{id}`
- Auth: `Bearer <token>`
- Body: kosong

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/programs/1
  ```

Response sukses akan berupa status HTTP `204 No Content`.

## 3. Orders

Order = transaksi pembelian satu atau lebih program oleh user.

Semua endpoint orders membutuhkan auth: `Bearer <token>`.

### 3.1 List Orders (user login)

- Method: `GET`
- URL: `/orders`
- Auth: `Bearer <token>`

**Query params (opsional):**

- `status`: `pending | paid | expired | failed`
- `page`, `per_page`: pagination

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/orders?status=pending&page=1&per_page=10
  ```

- Header:

  ```text
  Authorization: Bearer {{token}}
  ```

- Body: kosong

### 3.2 Detail Order

- Method: `GET`
- URL: `/orders/{id}`
- Auth: `Bearer <token>`

Catatan:

- Order hanya bisa diakses oleh pemiliknya (user_id = id user login). Jika mencoba buka order milik orang lain akan mendapat `403 Forbidden`.

**Contoh hit di Postman:**

- URL:

  ```text
  {{base_url}}/orders/1
  ```

- Header:

  ```text
  Authorization: Bearer {{token}}
  ```

- Body: kosong

### 3.3 Create Order

- Method: `POST`
- URL: `/orders`
- Auth: `Bearer <token>`

**Request body (raw JSON):**

```json
{
  "programs": [
    {
      "id": 1,
      "quantity": 1
    },
    {
      "id": 2,
      "quantity": 2
    }
  ],
  "payment_provider": "midtrans",
  "payment_reference": "INV-2025-0001",
  "meta": {
    "note": "checkout dari landing page promo",
    "channel": "web"
  }
}
```

Field:

- `programs`: required, array minimal 1 item
  - `programs[*].id`: required, integer, harus ada di tabel `programs`
  - `programs[*].quantity`: optional, integer minimal 1 (default 1)
- `payment_provider`: optional, string (contoh: `midtrans`, `xendit`)
- `payment_reference`: optional, string (contoh kode invoice internal)
- `meta`: optional, object JSON (metadata tambahan)

Catatan keamanan:

- Harga (`price`) dan `total` dihitung ulang di server berdasarkan data `programs` di database (bukan dari client).
- Hanya program dengan `active = true` yang bisa dipesan.
- `user_id` di order selalu diambil dari token (`auth:sanctum`), bukan dari body.

**Response sukses (ringkas):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 10,
    "user_id": 1,
    "status": "pending",
    "total": 775000,
    "payment_provider": "midtrans",
    "payment_reference": "INV-2025-0001",
    "snap_token": null,
    "meta": {
      "note": "checkout dari landing page promo",
      "channel": "web"
    },
    "created_at": "2025-10-29T10:10:00Z",
    "updated_at": "2025-10-29T10:10:00Z",
    "items": [
      {
        "id": 1,
        "program_id": 1,
        "price": 250000,
        "quantity": 1
      },
      {
        "id": 2,
        "program_id": 2,
        "price": 262500,
        "quantity": 2
      }
    ]
  }
}
```

Jika ada program yang tidak valid atau tidak aktif, response akan seperti:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "programs": [
      "One or more programs are invalid or inactive"
    ]
  }
}
```

## 4. Saran Setup Postman

Untuk mempermudah testing:

- Buat environment Postman dengan variable:

  ```text
  base_url = http://localhost:8000/api/v1
  token    = (akan diisi setelah login)
  ```

- Flow testing tipikal:

  1. `POST {{base_url}}/auth/login` → ambil `data.token` → set ke `{{token}}`.
  2. `GET {{base_url}}/programs` → lihat list program.
  3. `POST {{base_url}}/orders` → buat order dari program yang ada.
  4. `GET {{base_url}}/orders` → cek list order user.
  5. `GET {{base_url}}/orders/{id}` → cek detail order.

