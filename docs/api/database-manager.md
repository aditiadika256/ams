# Dokumentasi API: Database Manager (System & Maintenance)

Spesifikasi endpoint backend untuk pemantauan metrik database, pembersihan cache usang, pemicu indeks ulang (*reindexing*), dan pencatatan snapshot cadangan sistem.

---

## 1. Database Tools (`/api/v1/admin/database`)

### 1.1 Get Database Metrics
Mengambil ringkasan jumlah record tabel, status integritas data, dan log pemeliharaan terakhir.

- **URL**: `GET /api/v1/admin/database/metrics`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings`

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Database metrics retrieved successfully",
  "data": {
    "engine": "PostgreSQL (Cloud Aiven)",
    "tables": [
      { "table_name": "users", "row_count": 1250, "status": "HEALTHY" },
      { "table_name": "programs", "row_count": 48, "status": "HEALTHY" },
      { "table_name": "questions", "row_count": 3400, "status": "HEALTHY" },
      { "table_name": "exam_item_responses", "row_count": 45000, "status": "HEALTHY" }
    ],
    "recent_logs": [ ... ],
    "timestamp": "2026-10-26T12:00:00Z"
  }
}
```

---

### 1.2 Execute Maintenance Routine
Mengeksekusi aksi pemeliharaan database langsung dari dashboard admin.

- **URL**: `POST /api/v1/admin/database/execute`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings`
- **Request Body**:
```json
{
  "action": "clear_cache"
}
```

Aksi yang didukung:
- `clear_cache`: Menghapus cache kedaluwarsa di Redis dan database internal.
- `reindex_transactions`: Mengoptimalkan ulang indeks kueri buku besar keuangan.
- `vacuum_analyze`: Menganalisis statistik perencana kueri PostgreSQL.
- `backup_snapshot`: Membuat penanda snapshot darurat pemulihan data.

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Maintenance action 'clear_cache' executed in 45 ms",
  "data": {
    "id": 1,
    "action": "clear_cache",
    "execution_time_ms": 45,
    "status": "success",
    "output_details": {
      "message": "Application and Redis cache flushed successfully."
    }
  }
}
```
