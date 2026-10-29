# Developer Guide: Admin Views UI & Form Design Standards

Dokumen panduan pengembang ini merangkum standardisasi antarmuka (UI), audit kontras warna (WCAG AA), kepatuhan palet dinamis, implementasi gaya *glassmorphism*, dan responsivitas mobile pada seluruh form dan view admin di `apps/web/src/components/admin/views`.

---

## 1. Prinsip Utama Desain

Sesuai dengan ketentuan arsitektur AMS dan standar UI/UX modern (`ui-ux-pro-max` & `design-mobile-apps`):

1. **Gaya Glassmorphism Terstandar**:
   - Seluruh kontainer, dialog modal, dan kartu menggunakan utilitas Tailwind dengan `backdrop-blur-*` dan opacity kartu semantik (`bg-card/60` hingga `bg-card/95`).
   - Hindari background solid `bg-white dark:bg-zinc-950` pada dialog modal.
2. **Kepatuhan Palet Warna Dinamis & Theme Toggle**:
   - Dilarang keras melakukan *hardcode* warna gradien atau warna solid seperti `bg-blue-600`, `bg-indigo-600`, atau `hover:bg-purple-200`.
   - Gunakan token semantik: `bg-primary`, `hover:bg-primary/90`, `text-primary-foreground`. Dengan demikian, tombol utama otomatis beradaptasi saat pengguna mengganti palet (misal: Emerald, Violet, Rose, Ocean Blue).
3. **Audit Kontras Warna (WCAG AA 4.5:1)**:
   - Warna teks terang seperti `text-emerald-300`, `text-green-400`, `text-amber-400`, `text-blue-300`, dan `text-red-300` memiliki rasio kontras sangat rendah ($< 3:1$) terhadap latar belakang light mode sehingga tidak terbaca.
   - Pola yang wajib digunakan untuk status & badge:
     - **Sukses / Aktif**: `bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30`
     - **Peringatan / Pending**: `bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30`
     - **Info / Sedang Berjalan**: `bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30`
     - **Destruktif / Ditolak**: `bg-destructive/15 text-destructive border-destructive/30`
4. **Responsivitas Mobile & Target Sentuh (Touch Targets)**:
   - Sesuai panduan ergonomi mobile, target sentuh interaktif (tombol, input, dropdown) harus memiliki tinggi minimum $40\text{--}44\text{px}$ (`min-h-11 sm:min-h-10`).
   - Grid input formulir harus fleksibel: `grid-cols-1 sm:grid-cols-2` agar tidak menyempit di layar kecil.
   - Tombol aksi dialog modal: `flex flex-col-reverse sm:flex-row justify-end gap-2` dengan `w-full sm:w-auto`.

---

## 2. Token & Kelas Standar

### Kontainer Modal Dialog
```tsx
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
  ...
</DialogContent>
```

### Kartu Glass
```tsx
<GlassCard className="border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
  <GlassCardHeader>
    <GlassCardTitle className="text-foreground">Judul Kartu</GlassCardTitle>
    <GlassCardDescription className="text-muted-foreground">Deskripsi penjelas</GlassCardDescription>
  </GlassCardHeader>
  <GlassCardContent>
    ...
  </GlassCardContent>
</GlassCard>
```

### Input & Textarea
```tsx
<Input
  className="min-h-11 sm:min-h-10 rounded-xl border border-input/60 bg-background/70 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
/>
```

### Tombol Aksi Utama & Sekunder
```tsx
{/* Tombol Utama */}
<Button className="min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm">
  Simpan
</Button>

{/* Tombol Sekunder / Batal */}
<Button variant="outline" className="min-h-11 sm:min-h-10 border-border/60 hover:bg-muted/60">
  Batal
</Button>
```

---

## 3. Inventaris Komponen yang Telah Diaudit

Seluruh form dan antarmuka pada `apps/web/src/components/admin/views` telah diaudit dan diperbarui:

1. **MediaLibrary** (`form.tsx`, `view.tsx`)
2. **Users** (`form.tsx`, `view.tsx`)
3. **RolesPermissions** (`form.tsx`, `view.tsx`)
4. **MenuManagement** (`form.tsx`, `view.tsx`)
5. **Mentors** (`form.tsx`, `view.tsx`)
6. **CMSPosts** (`form.tsx`, `view.tsx`)
7. **finance** (`form.tsx`, `view.tsx`, `FinanceTransactions.tsx`, `FinanceInvoices.tsx`, `FinanceReports.tsx`)
8. **Tags** (`view.tsx`)
9. **Components** (`form.tsx`, `view.tsx`)
10. **AssessmentContexts** (`view.tsx`)
11. **AssessmentQuestions** (`view.tsx`)
12. **ComponentAssessments** (`view.tsx`)
13. **FinanceHolds** (`view.tsx`)
14. **Enrollments** (`view.tsx`)
15. **SchedulePhysicalRoom** (`view.tsx`)
16. **ProgramContent** (`ContentForm.tsx`, `GenericContentEditor.tsx`, `MaterialEditor.tsx`, `view.tsx`)
17. **Programs** (`form.tsx`, `view.tsx`, `ProgramBasicsStep.tsx`, `ProgramBatchesStep.tsx`, `ProgramCollectionStep.tsx`, `ProgramComponentsStep.tsx`, `ProgramDeliveryDialog.tsx`, `ProgramReviewStep.tsx`, `ProgramTagsStep.tsx`)
18. **CurriculumBuilder** (`view.tsx`)
19. **ColorPalette** (`form.tsx`, `view.tsx`)
20. **Consolidation** (`view.tsx`)
21. **MonitorProctoring** (`view.tsx`)
22. **MonitorAnalysis** (`view.tsx`)
23. **MonitorAssessmentResults** (`view.tsx`)
24. **DatabaseManager** (`view.tsx`)
25. **Dashboard** (`view.tsx`)
26. **Layout Navigation** (`AdminHeader.tsx`, `AdminSidebar.tsx`, `AdminTabs.tsx`)

