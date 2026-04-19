# API Documentation – Finance & Analytics

Dokumentasi ini menjelaskan endpoint untuk modul Keuangan (Transactions, Invoices, Reports) dan Analytics (Exam Performance, User Progress).
Semua endpoint membutuhkan autentikasi (Bearer Token).

## Base URL

```text
http://localhost:8000/api/v1
```

## Header

```text
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token_dari_login>
```

---

## 1. Transactions

Manajemen transaksi keuangan (Pemasukan & Pengeluaran).

### List Transactions
- **Method**: `GET`
- **URL**: `/finance/transactions`
- **Query Params**:
  - `type`: `income` | `expense`
  - `status`: `pending` | `completed` | `cancelled`
  - `start_date`: `YYYY-MM-DD`
  - `end_date`: `YYYY-MM-DD`

### Create Transaction
- **Method**: `POST`
- **URL**: `/finance/transactions`
- **Body**:
```json
{
  "type": "income",
  "category": "Tuition Fee",
  "amount": 5000000,
  "transaction_date": "2024-12-24",
  "description": "Pembayaran SPP",
  "payment_method": "Transfer",
  "status": "completed"
}
```

### Get Transaction Details
- **Method**: `GET`
- **URL**: `/finance/transactions/{id}`

### Update Transaction
- **Method**: `PUT`
- **URL**: `/finance/transactions/{id}`
- **Body**: (Partial update allowed)
```json
{
  "status": "completed",
  "description": "Updated description"
}
```

### Delete Transaction
- **Method**: `DELETE`
- **URL**: `/finance/transactions/{id}`

### Transaction Stats
- **Method**: `GET`
- **URL**: `/finance/transactions/stats/summary`
- **Response**:
```json
{
  "total_income": 10000000,
  "total_expense": 2000000,
  "net_profit": 8000000,
  "recent_transactions": [...]
}
```

---

## 2. Invoices

Manajemen tagihan (Invoicing).

### List Invoices
- **Method**: `GET`
- **URL**: `/finance/invoices`
- **Query Params**:
  - `status`: `draft` | `sent` | `paid` | `overdue` | `cancelled`

### Create Invoice
- **Method**: `POST`
- **URL**: `/finance/invoices`
- **Body**:
```json
{
  "user_id": 1,
  "issue_date": "2024-12-24",
  "due_date": "2024-12-31",
  "notes": "Thank you for your business",
  "items": [
    {
      "description": "Web Development Course",
      "quantity": 1,
      "unit_price": 1500000
    }
  ]
}
```

### Get Invoice Details
- **Method**: `GET`
- **URL**: `/finance/invoices/{id}`

### Update Invoice Status
- **Method**: `PUT`
- **URL**: `/finance/invoices/{id}`
- **Body**:
```json
{
  "status": "paid"
}
```

---

## 3. Reports

Laporan keuangan dan analytics.

### Custom Report
- **Method**: `GET`
- **URL**: `/finance/reports/custom`
- **Query Params**:
  - `start_date`: `YYYY-MM-DD`
  - `end_date`: `YYYY-MM-DD`
  - `type`: `revenue` | `orders`
  - `group_by`: `day` | `month`

### Daily Revenue
- **Method**: `GET`
- **URL**: `/finance/revenue/daily`
- **Query Params**:
  - `start_date`: `YYYY-MM-DD`
  - `end_date`: `YYYY-MM-DD`

### Revenue Summary
- **Method**: `GET`
- **URL**: `/finance/revenue/summary`

---

## 4. Analytics

Analitik performa ujian dan progres user.

### Exam Analytics
- **Method**: `GET`
- **URL**: `/analytics/exams/{id}`
- **Description**: Mendapatkan statistik untuk paket ujian tertentu (rata-rata skor, pass rate, analisis soal).

### User Progress
- **Method**: `GET`
- **URL**: `/analytics/user/progress`
- **Description**: Mendapatkan progres belajar user yang sedang login.

### Performance Metrics
- **Method**: `GET`
- **URL**: `/analytics/user/performance`
- **Description**: Mendapatkan metrik performa (akurasi, kecepatan, kekuatan/kelemahan).

### Recommendations
- **Method**: `GET`
- **URL**: `/analytics/recommendations`
- **Description**: Mendapatkan rekomendasi materi/soal berdasarkan performa user.
