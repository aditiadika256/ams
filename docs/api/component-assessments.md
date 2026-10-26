# Dokumentasi API: Component Assessments (Layer 2 Blueprint Builder)

Spesifikasi endpoint backend untuk perakitan paket ujian (*Exam Package Blueprints*) dan manajemen sub-tes (*Exam Sections*) pada arsitektur CBT Layer 2 Arkanin Management System.

---

## 1. Blueprint Packages (`/api/v1/assessment/blueprints`)

### 1.1 List Blueprints
Mengambil daftar blueprint paket ujian aktif beserta relasi sub-tes dan jumlah butir soal.

- **URL**: `GET /api/v1/assessment/blueprints`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings` | `manage_learning_content`
- **Query Parameters**:
  - `search` (string, opsional): Pencarian berdasarkan nama blueprint paket.
  - `visual_mode` (string, opsional): Filter visual exam layout (`standard`, `cpns`, `utbk`, `akm`, `osn`, `omi`).
  - `page` (integer, default: 1): Nomor halaman.
  - `per_page` (integer, default: 15): Jumlah item per halaman.

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Blueprints retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Paket Simulasi SKD CPNS 2026 - Premium",
      "visual_mode": "cpns",
      "scoring_mode": "scale_tkp",
      "negative_marking": false,
      "level": "all",
      "duration_minutes": 100,
      "randomize": true,
      "row_status": 1,
      "sections": [
        {
          "id": 101,
          "subject": "Tes Wawasan Kebangsaan (TWK)",
          "sort_order": 1,
          "transition_mode": "direct_continuous",
          "break_duration_seconds": 0,
          "section_timer_minutes": 30,
          "questions_count": 30
        },
        {
          "id": 102,
          "subject": "Tes Intelegensia Umum (TIU)",
          "sort_order": 2,
          "transition_mode": "direct_continuous",
          "break_duration_seconds": 0,
          "section_timer_minutes": 35,
          "questions_count": 35
        },
        {
          "id": 103,
          "subject": "Tes Karakteristik Pribadi (TKP)",
          "sort_order": 3,
          "transition_mode": "direct_continuous",
          "break_duration_seconds": 0,
          "section_timer_minutes": 35,
          "questions_count": 45
        }
      ],
      "created_by": 1,
      "updated_by": 1,
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

### 1.2 Get Single Blueprint Detail
Mengambil informasi lengkap satu blueprint paket ujian beserta sub-tes dan butir soal yang dipetakan.

- **URL**: `GET /api/v1/assessment/blueprints/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Blueprint retrieved successfully",
  "data": {
    "id": 1,
    "name": "Paket Simulasi SKD CPNS 2026 - Premium",
    "visual_mode": "cpns",
    "scoring_mode": "scale_tkp",
    "negative_marking": false,
    "level": "all",
    "duration_minutes": 100,
    "randomize": true,
    "row_status": 1,
    "sections": [
      {
        "id": 101,
        "subject": "Tes Wawasan Kebangsaan (TWK)",
        "sort_order": 1,
        "transition_mode": "direct_continuous",
        "break_duration_seconds": 0,
        "section_timer_minutes": 30,
        "questions": [
          {
            "id": 501,
            "title": "Soal Amandemen UUD 1945",
            "type": "multiple_choice",
            "score": 5,
            "pivot": {
              "sort_order": 1,
              "created_at": "2026-10-26T12:00:00Z",
              "updated_at": "2026-10-26T12:00:00Z"
            }
          }
        ]
      }
    ],
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-10-26T12:00:00Z",
    "updated_at": "2026-10-26T12:00:00Z"
  }
}
```

---

### 1.3 Create Blueprint
Membuat blueprint paket ujian baru lengkap dengan definisi multi sub-tes (atomic transaction).

- **URL**: `POST /api/v1/assessment/blueprints`
- **Authentication**: `Bearer Token` (Sanctum)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Simulasi UTBK SNBT 2026 Gelombang 1",
  "visual_mode": "utbk",
  "scoring_mode": "irt_2pl",
  "negative_marking": false,
  "level": "all",
  "duration_minutes": 195,
  "randomize": true,
  "sections": [
    {
      "subject": "Penalaran Matematika",
      "sort_order": 1,
      "transition_mode": "intermission_break",
      "break_duration_seconds": 180,
      "section_timer_minutes": 30,
      "num_questions": 20
    },
    {
      "subject": "Literasi Bahasa Indonesia",
      "sort_order": 2,
      "transition_mode": "direct_continuous",
      "break_duration_seconds": 0,
      "section_timer_minutes": 45,
      "num_questions": 30
    }
  ]
}
```

**Field Validation**:
- `name`: required | string | max:255
- `visual_mode`: required | in:standard,cpns,utbk,akm,osn,omi
- `scoring_mode`: required | in:same_weight,custom_weight,scale_tkp,irt_2pl
- `negative_marking`: boolean
- `duration_minutes`: required | integer | min:1
- `sections`: array | min:1
- `sections.*.subject`: required | string | max:255
- `sections.*.sort_order`: required | integer | min:1
- `sections.*.transition_mode`: in:direct_continuous,intermission_break
- `sections.*.break_duration_seconds`: integer | min:0
- `sections.*.section_timer_minutes`: nullable | integer | min:1

**Contoh Response `201 Created`**:
```json
{
  "success": true,
  "message": "Blueprint created successfully",
  "data": {
    "id": 2,
    "name": "Simulasi UTBK SNBT 2026 Gelombang 1",
    "visual_mode": "utbk",
    "scoring_mode": "irt_2pl",
    "negative_marking": false,
    "sections": [ ... ],
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2026-10-26T12:00:00Z",
    "updated_at": "2026-10-26T12:00:00Z"
  }
}
```

---

### 1.4 Update Blueprint
Memperbarui metadata blueprint paket dan menyinkronkan daftar sub-tes.

- **URL**: `PUT /api/v1/assessment/blueprints/{id}`
- **Authentication**: `Bearer Token` (Sanctum)
- **Headers**: `Content-Type: application/json`

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Blueprint updated successfully",
  "data": {
    "id": 2,
    "name": "Simulasi UTBK SNBT 2026 Gelombang 1 (Revisi)",
    "visual_mode": "utbk",
    "scoring_mode": "irt_2pl",
    "updated_at": "2026-10-26T12:15:00Z"
  }
}
```

---

### 1.5 Soft Delete Blueprint
Menghapus blueprint dengan merubah `row_status` menjadi `0`.

- **URL**: `DELETE /api/v1/assessment/blueprints/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Blueprint deleted successfully"
}
```
