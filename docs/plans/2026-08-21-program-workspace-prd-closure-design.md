# Program Workspace PRD Closure Design

## Tujuan

Menutup gap PRD setelah cutover core tanpa memperluas refactor ke seluruh domain aplikasi. Kontrak yang ditampilkan kepada admin dan user harus mencerminkan kapabilitas yang benar-benar tersedia, sementara progress, completion, mentor assignment, dan perubahan jadwal tetap berpusat pada `ProgramAccess`.

## Keputusan arsitektur

### Truthful component registry

Registry tetap berisi 14 code PRD, tetapi `is_available` hanya aktif untuk component yang mempunyai authorization backend dan tujuan frontend nyata. `material`, `assessment`, dan `meeting` tersedia pada cutover awal; `certificate` diaktifkan setelah ledger, evaluator, resource, dan tujuan Workspace selesai pada Task 14. Component lain tetap terlihat read-only sebagai roadmap, tidak dapat diaktifkan, dan ditolak kembali oleh Action backend untuk mencegah bypass UI.

### Activity, progress, completion, dan certificate

Aktivitas user disimpan secara idempotent pada ledger `program_access_activities` dengan unique key per access/component/activity. Material completion dicatat dari lesson yang benar-benar berada pada Program access; assessment completion dicatat setelah attempt berhasil disubmit. Projection progress menghitung target dari lesson terbit dan package assessment yang dikonfigurasi, bukan dari angka bebas.

`completion_rule` menggunakan contract terbatas `all[]` dengan requirement component, metric, operator, dan value. Evaluator membaca metric projection dan mengubah access menjadi `COMPLETED` secara transactional ketika seluruh requirement terpenuhi. Jika component certificate aktif dan tersedia, certificate immutable diterbitkan satu kali dengan nomor deterministik.

### Mentor assignment dan participant scope

Session memiliki `mentor_assignment_mode`: `ADMIN`, `STUDENT`, atau `HYBRID`. Assignment menyimpan kapasitas dan reservation counter. Untuk `STUDENT`/`HYBRID`, user memilih assignment aktif melalui endpoint Workspace; row lock dan unique constraint menjadi guard terakhir race slot. Mentor hanya dapat membaca peserta dari Session tempat ia memiliki assignment aktif. Pada mode admin daftar peserta berasal dari access Batch aktif; pada mode student/hybrid hanya reservation milik assignment tersebut.

### Reschedule propagation

Reschedule menulis audit dalam transaction dan menerbitkan event `ShouldDispatchAfterCommit`. Listener queued membuat inbox update idempotent bagi peserta dan mentor. Kegagalan listener tidak membatalkan perubahan Session dan dapat diretry oleh queue.

### Frontend dan quality gate

Workspace hanya merender deep link untuk component tersedia, menampilkan progress breakdown/certificate, dan menyediakan pemilihan mentor bila mode Session mengizinkan. Admin Session menyediakan mode mentor, capacity assignment, dan pengelolaan assignment. Semua kontrol memiliki label, keyboard focus, status teks, target sentuh minimum, dark mode, dan reduced-motion. PostgreSQL concurrency mencakup payment callback, Batch capacity, dan mentor slot; browser checks mencakup 375/768/1024/1440 dan accessibility smoke.
