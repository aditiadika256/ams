# API Documentation – CBT (Computer Based Test)

Dokumentasi ini menjelaskan endpoint untuk sistem ujian berbasis komputer (CBT).
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

## Workflow Ujian

1. **Start Exam**: User memulai ujian dari paket soal tertentu.
2. **Fetch Questions**: User mengambil daftar soal.
3. **Answer**: User menjawab soal satu per satu (autosave).
4. **Submit**: User menyelesaikan ujian.
5. **Result**: User melihat hasil ujian.

---

## 1. Start Exam

Memulai sesi ujian baru atau melanjutkan sesi yang belum selesai.

- **Method**: `POST`
- **URL**: `/exams/start`

**Request Body:**

```json
{
  "package_id": 1
}
```

**Response Sukses (New Session):**

```json
{
  "success": true,
  "message": "Exam started successfully",
  "data": {
    "session_id": 10,
    "attempt_id": 25,
    "restored": false
  }
}
```

**Response Sukses (Resume Session):**

```json
{
  "success": true,
  "message": "Resuming existing exam attempt",
  "data": {
    "session_id": 10,
    "attempt_id": 25,
    "restored": true
  }
}
```

---

## 2. Fetch Questions

Mengambil daftar soal untuk attempt tertentu. Soal yang dikembalikan **tidak mengandung kunci jawaban**.

- **Method**: `GET`
- **URL**: `/exams/{attempt_id}/questions`

**Response Sukses:**

```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": [
    {
      "id": 101,            // ID jawaban (gunakan ini atau question_id untuk referensi UI)
      "question_id": 50,
      "type": "mcq",
      "stem": "Apa ibu kota Indonesia?",
      "options": {
        "A": "Bandung",
        "B": "Jakarta",
        "C": "Surabaya",
        "D": "Medan"
      },
      "user_answer": null,  // Jawaban user saat ini (null jika belum dijawab)
      "flagged": false
    },
    {
      "id": 102,
      "question_id": 51,
      "type": "mcq",
      "stem": "2 + 2 = ?",
      "options": {
        "A": "3",
        "B": "4",
        "C": "5"
      },
      "user_answer": "B",   // Contoh jika sudah dijawab
      "flagged": false
    }
  ]
}
```

---

## 3. Autosave Answer

Menyimpan jawaban user untuk satu soal.

- **Method**: `POST`
- **URL**: `/exams/{attempt_id}/answers`

**Request Body:**

```json
{
  "question_id": 50,
  "answer": "B"
}
```

**Response Sukses:**

```json
{
  "success": true,
  "message": "Answer saved",
  "data": null
}
```

---

## 4. Submit Exam

Menyelesaikan ujian dan menghitung nilai. Setelah submit, ujian tidak bisa diedit lagi.

- **Method**: `POST`
- **URL**: `/exams/{attempt_id}/submit`

**Request Body:** Kosong `{}`

**Response Sukses:**

```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "score": 85,
    "submitted_at": "2025-12-21T10:30:00.000000Z"
  }
}
```

---

## 5. Get Result

Melihat hasil ujian yang sudah disubmit.

- **Method**: `GET`
- **URL**: `/exams/{attempt_id}/result`

**Response Sukses:**

```json
{
  "success": true,
  "message": "Exam result retrieved",
  "data": {
    "attempt_id": 25,
    "package_name": "Tryout SNBT 2025",
    "score_total": 85,
    "submitted_at": "2025-12-21T10:30:00.000000Z"
  }
}
```

**Response Error (Belum Submit):**

```json
{
  "success": false,
  "message": "Exam not yet submitted"
}
```
