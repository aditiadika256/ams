# Developer Guide: Live Proctoring & IRT Engine (Layer 4 CBT)
# Arkanin Management System (AMS)

Panduan teknis dan arsitektur pengembangan untuk modul **Live Proctoring & Item Analysis** (Layer 4 CBT).

---

## 1. Arsitektur Data & Model Eloquent

Layer 4 CBT terdiri dari entitas:
1. `ExamSessionToken` (`exam_session_tokens`): Penyimpan kode token 6-karakter sesi ujian dinamis dengan TTL 30 menit.
2. `ProctorLog` (`proctor_logs`): Audit log kejadian kecurangan (`tab_switch`, `fullscreen_exit`) dan aksi pengawas (`proctor_warn`, `proctor_disqualify`).
3. `ExamItemResponse` (`exam_item_responses`): Matriks respons granular per butir soal per siswa (waktu jawab, kunci dipilih, status benar/salah).
4. `ItemAnalysisParameter` (`item_analysis_parameters`): Parameter psikometrik hasil estimasi model IRT 2PL ($b, a, c$), efisiensi distraktor, dan status pembatalan (*drop status*).

### Standard Database & Audit Trail
Semua tabel wajib menyertakan kolom identitas dan audit:
- `id`, `row_status`, `created_at`, `created_by`, `updated_at`, `updated_by`
- Menggunakan trait `App\Traits\UserStamps` untuk pengisian otomatis aktor pencipta dan pengubah record.

---

## 2. Dynamic Token Generation & Redis Caching

Untuk menjamin latensi validasi token $< 2\text{ ms}$ pada saat ribuan siswa login serentak:
1. Token di-generate menggunakan `strtoupper(Str::random(6))`.
2. Disimpan ke tabel PostgreSQL `exam_session_tokens` untuk audit trail permanen.
3. Di-cache ke Redis key `cbt_token_{CODE}` dengan TTL 30 menit:

```php
Cache::put("cbt_token_{$tokenCode}", [
    'token_id' => $token->id,
    'package_id' => $token->package_id,
    'expires_at' => $expiresAt->toIso8601String(),
], $expiresAt);
```

---

## 3. Psychometric Calculation Engine (IRT 2PL / Rasch)

Kalkulasi psikometrik pada `App\Domain\CBT\ItemAnalysisController@calculate` mengimplementasikan formula Item Response Theory:

### 1. Tingkat Kesukaran ($b$ - Difficulty)
Ditransformasikan dari proporsi jawaban benar ($p = \frac{R}{N}$):
$$b = -\ln\left(\frac{p}{1 - p}\right)$$
Dibatasi pada rentang standardisasi $-3.00 \le b \le +3.00$.

### 2. Daya Pembeda ($a$ - Discrimination)
Dihitung dari selisih proporsi kelompok atas 27% ($P_U$) dan kelompok bawah 27% ($P_L$):
$$D = P_U - P_L$$
$$a = \max(0.1, \min(2.5, D \times 2.2))$$

### 3. Fit Status & Drop Question
- Jika $a < 0.25$ atau $p < 0.10$ atau $p > 0.90$, sistem menandai item sebagai `unfit`.
- Jika admin mengeksekusi `dropQuestion()`, sistem mengatur `is_dropped = true` dan mengeksekusi re-evaluasi skor total siswa di dalam transaksi database:

```php
DB::transaction(function () use ($packageId, $questionId) {
    ItemAnalysisParameter::where('exam_package_id', $packageId)
        ->where('question_id', $questionId)
        ->update(['fit_status' => 'dropped', 'is_dropped' => true]);

    $attempts = ExamAttempt::whereHas('session', fn ($q) => $q->where('package_id', $packageId))->get();
    foreach ($attempts as $attempt) {
        $attempt->score_total = ExamItemResponse::where('exam_attempt_id', $attempt->id)
            ->where('question_id', '!=', $questionId)
            ->sum('score_earned');
        $attempt->save();
    }
});
```

---

## 4. Frontend Views (`apps/web`)

Tiga tampilan antarmuka dibangun dengan gaya Glassmorphism:
1. `admin://view/monitor-proctoring`: Grid live proctoring, generator token modal, dan tombol kontrol siswa.
2. `admin://view/monitor-analysis`: Dashboard kurva butir, parameter kesukaran & pembeda, tombol anulir soal.
3. `admin://view/monitor-assessment-results`: Papan peringkat (scoreboard), filter performa, dan ekspor CSV.
