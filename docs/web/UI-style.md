2. Tech Stack Tools (Rekomendasi)

Jangan membuat semuanya dari nol. Gunakan library ini untuk mempercepat development namun tetap ringan:

UI Primitives: Shadcn UI (Wajib. Sangat mobile friendly, copy-paste components).

Animations: Framer Motion (Standar industri untuk Next.js).

Icons: Lucide React (Modern, stroke rounded, sangat rapi).

Mobile Drawer: Vaul (Drawer yang bisa ditarik/swipe seperti aplikasi native).

3. Palet Warna (Simple & Modern)

Hindari hitam pekat (#000000) atau abu-abu standar. Gunakan palet Zinc atau Slate bawaan Tailwind untuk kesan premium, ditambah satu warna primer yang vibrant.

Background: bg-zinc-50 (Off-white, lebih nyaman di mata daripada putih murni) atau bg-white untuk kartu.

Text Utama: text-zinc-900 (Hampir hitam, kontras tinggi).

Text Sekunder: text-zinc-500 (Untuk deskripsi/label).

Border: border-zinc-200 (Tipis dan halus).

Primary Color: Pilih satu warna "listrik" tapi elegan.

Opsi 1 (Professional): Blue-600 (Royal Blue).

Opsi 2 (Trendy): Violet-600 atau Indigo-600.

Opsi 3 (Fresh): Teal-600.

4. Tipografi

Gunakan font sans-serif yang memiliki readability tinggi di layar kecil.

Rekomendasi: Geist Sans (Font default Next.js terbaru), Inter, atau Plus Jakarta Sans.

Styling:

Gunakan tracking-tight pada heading untuk kesan modern dan padat.

Ukuran font body minimal text-base (16px) agar input tidak zoom otomatis di iPhone dan mudah dibaca.

5. Layout & UX (Mobile First)

Karena user utama adalah mobile, lupakan "Navbar di atas" yang klasik. Gunakan pola navigasi aplikasi:

Bottom Navigation Bar:

Menu utama diletakkan di bawah (sticky bottom) agar mudah dijangkau jempol satu tangan.

Top Bar Sederhana:

Hanya untuk Logo (kiri) dan Notifikasi/Profile (kanan).

Cards & Containers:

Gunakan kartu dengan corner radius yang besar.

Class: rounded-xl atau rounded-2xl.

Shadow: shadow-sm (jangan terlalu tebal bayangannya).

Touch Targets:

Pastikan semua tombol dan link memiliki area sentuh minimal 44px tinggi/lebarnya.

Button size: h-12 atau h-14.

6. Animasi (Interaktif & Elegan)

Gunakan Framer Motion untuk memberikan feedback rasa. Jangan animasi yang berlebihan, cukup mikro-interaksi.

Tap Feedback (Wajib untuk Mobile):

Tombol sedikit mengecil saat ditekan. Memberikan kesan tombol itu "ditekan".

Page Transition:

Konten muncul perlahan dari bawah ke atas (Fade In Up).

Staggered List:

Jika ada list item, munculkan satu per satu dengan jeda sangat singkat.