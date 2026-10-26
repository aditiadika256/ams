# Dokumentasi API: Live Proctoring & IRT Engine (Layer 4 CBT)

Spesifikasi endpoint backend untuk pengawasan ujian real-time (*Live Proctoring Grid*), pembuatan token sesi dinamis, penanganan insiden kecurangan (*fraud incident control*), analisis psikometrik butir soal (*IRT 2PL / Rasch Analysis*), dan fitur pembatalan butir soal (*Drop Question*).

---

## 1. Live Proctoring & Token Control

### 1.1 List Live Exam Attempts
Mengambil daftar peserta ujian aktif, idle, atau bermasalah secara real-time.

- **URL**: `GET /api/v1/assessment/proctor/live`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings` | `manage_learning_content`
- **Query Parameters**:
  - `package_id` (integer, opsional): Filter berdasarkan blueprint paket ujian.
  - `status` (string, opsional): `all`, `active`, `idle`, `warned`, `disqualified`, `completed`, `paused`.
  - `search` (string, opsional): Pencarian nama siswa atau email.
  - `per_page` (integer, default: 24).

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Live attempts retrieved successfully",
  "data": [
    {
      "id": 12,
      "session_id": 4,
      "started_at": "2026-10-26T13:00:00Z",
      "submitted_at": null,
      "score_total": null,
      "proctor_status": "active",
      "session": {
        "package": {
          "id": 1,
          "name": "Simulasi SKD CPNS 2026",
          "visual_mode": "cpns",
          "duration_minutes": 100
        },
        "user": {
          "id": 88,
          "name": "Budi Santoso",
          "email": "budi@student.arkanin.id"
        }
      },
      "proctor_logs": []
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 24,
    "total": 1
  }
}
```

---

### 1.2 Generate Dynamic Session Token
Menghasilkan token 6-karakter acak huruf kapital dengan masa berlaku 30 menit (tersimpan di PostgreSQL & Redis Cache TTL 30m).

- **URL**: `POST /api/v1/assessment/proctor/tokens/generate`
- **Authentication**: `Bearer Token` (Sanctum)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "package_id": 1,
  "session_id": null,
  "ttl_minutes": 30
}
```

**Contoh Response `201 Created`**:
```json
{
  "success": true,
  "message": "Dynamic token generated successfully",
  "data": {
    "id": 5,
    "package_id": 1,
    "token_code": "ARK98X",
    "is_active": true,
    "expires_at": "2026-10-26T13:45:00Z",
    "created_at": "2026-10-26T13:15:00Z"
  }
}
```

---

### 1.3 Proctor Action on Student Attempt
Melakukan tindakan pengawas terhadap sesi pengerjaan siswa (`warn`, `pause`, `resume`, `reset`, `disqualify`, `force_submit`).

- **URL**: `POST /api/v1/assessment/proctor/attempts/{attemptId}/action`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "action": "warn",
  "reason": "Terdeteksi berpindah tab browser 2 kali berturut-turut"
}
```

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Proctor action 'warn' applied successfully",
  "data": {
    "attempt_id": 12,
    "proctor_status": "warned",
    "action": "warn"
  }
}
```

---

## 2. Psychometric Item Analysis & IRT 2PL

### 2.1 Get Item Analysis Report
Mengambil parameter psikometrik ($b$: Kesukaran, $a$: Daya Pembeda, $c$: Tebakan Acak) dan kurva efisiensi distraktor tiap butir soal.

- **URL**: `GET /api/v1/assessment/analysis/{packageId}`
- **Authentication**: `Bearer Token` (Sanctum)

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Item analysis retrieved successfully",
  "data": {
    "package": {
      "id": 1,
      "name": "Simulasi SKD CPNS 2026",
      "visual_mode": "cpns",
      "scoring_mode": "scale_tkp"
    },
    "items": [
      {
        "question_id": 101,
        "section_id": 2,
        "section_name": "Tes Intelegensia Umum (TIU)",
        "stem": "Jika $2x + 5 = 15$, maka nilai $x$ adalah...",
        "difficulty_level": "medium",
        "difficulty_b": 0.15,
        "discrimination_a": 1.25,
        "pseudo_guessing_c": 0.20,
        "fit_status": "fit",
        "is_dropped": false,
        "sample_size": 150,
        "distractor_efficiency": [
          { "key": "A", "count": 15, "percentage": 10.0 },
          { "key": "B", "count": 105, "percentage": 70.0 },
          { "key": "C", "count": 12, "percentage": 8.0 },
          { "key": "D", "count": 10, "percentage": 6.7 },
          { "key": "E", "count": 8, "percentage": 5.3 }
        ],
        "analyzed_at": "2026-10-26T13:00:00Z"
      }
    ],
    "summary": {
      "total_items": 110,
      "fit_count": 108,
      "unfit_count": 2,
      "dropped_count": 0
    }
  }
}
```

---

### 2.2 Trigger IRT Recalculation
Memicu perhitungan parameter IRT 2PL secara menyeluruh dari seluruh respons peserta ujian.

- **URL**: `POST /api/v1/assessment/analysis/{packageId}/calculate`
- **Authentication**: `Bearer Token` (Sanctum)

---

### 2.3 Drop Problematic Question (Anulir Soal)
Membatalkan / menganulir soal bermasalah dari paket ujian (`is_dropped = true`) dan secara otomatis mereevaluasi nilai total seluruh siswa tanpa menghapus butir soal dari bank soal induk.

- **URL**: `POST /api/v1/assessment/analysis/{packageId}/drop-question`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "question_id": 101,
  "reason": "Daya pembeda bernilai negatif dan kunci ganda"
}
```

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Question dropped and all participant scores re-evaluated successfully without deleting from Question Bank",
  "data": {
    "package_id": 1,
    "question_id": 101,
    "status": "dropped"
  }
}
```

---

### 2.4 Scoreboard & Assessment Results
Mengambil papan peringkat hasil ujian peserta (raw score vs skala konversi UTBK / CAT).

- **URL**: `GET /api/v1/assessment/results/{packageId}`
- **Authentication**: `Bearer Token` (Sanctum)
- **Query Parameters**:
  - `search` (string, opsional)
  - `page` (integer, default: 1)
  - `per_page` (integer, default: 20)
