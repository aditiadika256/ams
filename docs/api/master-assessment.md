# Dokumentasi API: Master Assessment (Layer 1 CBT)

Spesifikasi endpoint backend untuk pengelolaan wacana (*Context Bank*) dan butir soal (*Question Bank*) pada arsitektur CBT Layer 1 Arkanin Management System.

---

## 1. Context Bank (`/api/v1/assessment/contexts`)

### 1.1 List Contexts
Mengambil daftar wacana stimulus yang aktif.

- **URL**: `GET /api/v1/assessment/contexts`
- **Authentication**: `Bearer Token` (Sanctum)
- **Query Parameters**:
  - `search` (string, opsional): Pencarian berdasarkan judul atau teks wacana.
  - `media_type` (string, opsional): Filter media (`image`, `audio`, `video`).
  - `page` (integer, default: 1): Nomor halaman.
  - `per_page` (integer, default: 15): Jumlah item per halaman.

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Contexts retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Wacana Analisis Fiskal Negara",
      "body_content": "Wacana studi kasus pertumbuhan ekonomi makro... $$E = mc^2$$",
      "media_url": "https://cdn.arkanin.my.id/stimulus/chart-1.png",
      "media_type": "image",
      "row_status": 1,
      "questions_count": 5,
      "created_by": 2,
      "updated_by": 2,
      "created_at": "2026-10-26T12:00:00Z",
      "updated_at": "2026-10-26T12:00:00Z"
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

### 1.2 Create Context
Membuat wacana stimulus baru.

- **URL**: `POST /api/v1/assessment/contexts`
- **Authentication**: `Bearer Token` (Sanctum)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Wacana Analisis Fiskal Negara",
  "body_content": "Wacana studi kasus pertumbuhan ekonomi makro... $$E = mc^2$$",
  "media_url": "https://cdn.arkanin.my.id/stimulus/chart-1.png",
  "media_type": "image"
}
```

**Contoh Response `201 Created`**:
```json
{
  "success": true,
  "message": "Context created successfully",
  "data": {
    "id": 1,
    "title": "Wacana Analisis Fiskal Negara",
    "body_content": "Wacana studi kasus pertumbuhan ekonomi makro... $$E = mc^2$$",
    "media_url": "https://cdn.arkanin.my.id/stimulus/chart-1.png",
    "media_type": "image",
    "row_status": 1,
    "created_by": 2,
    "updated_by": 2,
    "created_at": "2026-10-26T12:00:00Z",
    "updated_at": "2026-10-26T12:00:00Z"
  }
}
```

---

### 1.3 Get Context Detail
Mengambil detail satu wacana beserta butir-butir pertanyaan yang terikat.

- **URL**: `GET /api/v1/assessment/contexts/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Context retrieved successfully",
  "data": {
    "id": 1,
    "title": "Wacana Analisis Fiskal Negara",
    "body_content": "Teks wacana lengkap...",
    "media_url": "https://cdn.arkanin.my.id/stimulus/chart-1.png",
    "media_type": "image",
    "questions": [
      {
        "id": 101,
        "context_id": 1,
        "type": "single",
        "stem": "Berdasarkan wacana di atas, apa faktor utama inflasi?",
        "difficulty": "medium",
        "estimated_seconds": 60,
        "score_weight": "1.00"
      }
    ]
  }
}
```

---

### 1.4 Update Context
Memperbarui wacana stimulus yang ada.

- **URL**: `PUT /api/v1/assessment/contexts/{id}`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**: Sama dengan pembuatan (semua field bersifat opsional).

---

### 1.5 Delete Context (Soft Delete)
Menonaktifkan wacana dengan mengubah status (`row_status = -1`).

- **URL**: `DELETE /api/v1/assessment/contexts/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Context deleted successfully"
}
```

---

## 2. Question Bank (`/api/v1/assessment/questions`)

### 2.1 List Questions
Mengambil daftar butir soal dengan filter dan relasi wacana.

- **URL**: `GET /api/v1/assessment/questions`
- **Authentication**: `Bearer Token` (Sanctum)
- **Query Parameters**:
  - `search` (string, opsional): Pencarian teks pertanyaan atau pembahasan.
  - `context_id` (integer, opsional): Filter butir soal berdasarkan ID wacana induk.
  - `difficulty` (string, opsional): `easy`, `medium`, `hard`, `hots`.
  - `type` (string, opsional): `single`, `scale`, `multi`, `essay`.
  - `status` (string, opsional): `draft`, `under_review`, `approved`, `revision_needed`.
  - `page` (integer, default: 1): Nomor halaman.
  - `per_page` (integer, default: 15): Jumlah item per halaman.

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": [
    {
      "id": 101,
      "context_id": 1,
      "context": {
        "id": 1,
        "title": "Wacana Analisis Fiskal Negara",
        "media_type": "image"
      },
      "stem": "Berapakah nilai $$x$$ jika $$2x + 4 = 10$$?",
      "type": "single",
      "difficulty": "medium",
      "estimated_seconds": 60,
      "score_weight": "1.00",
      "status": "approved",
      "options": [
        { "key": "A", "text": "2", "score": 0 },
        { "key": "B", "text": "3", "score": 1 },
        { "key": "C", "text": "4", "score": 0 }
      ],
      "answer_key": { "correct_key": "B" },
      "created_by": 2,
      "updated_by": 2,
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

### 2.2 Create Question
Membuat butir soal baru (Pilihan Ganda, Skala TKP 1-5, Kompleks, atau Esai).

- **URL**: `POST /api/v1/assessment/questions`
- **Authentication**: `Bearer Token` (Sanctum)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "context_id": 1,
  "stem": "Berapakah nilai $$x$$ jika $$2x + 4 = 10$$?",
  "type": "single",
  "difficulty": "medium",
  "estimated_seconds": 60,
  "score_weight": 1.0,
  "options": [
    { "key": "A", "text": "2", "score": 0 },
    { "key": "B", "text": "3", "score": 1 },
    { "key": "C", "text": "4", "score": 0 }
  ],
  "answer_key": { "correct_key": "B" },
  "explanation": "Penyelesaian: $$2x = 10 - 4 = 6$$, maka $$x = 3$$.",
  "status": "draft"
}
```

---

### 2.3 Get Question Detail
Mengambil detail satu butir soal beserta wacana lengkap.

- **URL**: `GET /api/v1/assessment/questions/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

---

### 2.4 Update Question
Memperbarui butir soal.

- **URL**: `PUT /api/v1/assessment/questions/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

---

### 2.5 Delete Question (Soft Delete)
Menonaktifkan butir soal (`row_status = -1`).

- **URL**: `DELETE /api/v1/assessment/questions/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

