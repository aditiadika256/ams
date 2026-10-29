"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Edit3, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { getErrorMessage } from "@/lib/get-error-message";
import { alertActions } from "@/store/useAlertStore";
import type {
  BatchMode,
  MentorOption,
  Program,
  ProgramBatch,
  ProgramSession,
  ProgramSessionPayload,
} from "@/types/sales";
import { ProgramMentorAssignments } from "./ProgramMentorAssignments";

interface Props {
  program: Program | null;
  open: boolean;
  canManageMentors: boolean;
  onOpenChange: (open: boolean) => void;
}
type MentorMode = ProgramSession["mentor_assignment_mode"];
const unwrap = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export function ProgramDeliveryDialog({
  program,
  open,
  canManageMentors,
  onOpenChange,
}: Props) {
  const [batches, setBatches] = useState<ProgramBatch[]>([]);
  const [batchId, setBatchId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [selected, setSelected] = useState<ProgramSession | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mode, setMode] = useState<BatchMode>("ONLINE");
  const [mentorMode, setMentorMode] = useState<MentorMode>("ADMIN");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [capacity, setCapacity] = useState("");

  const loadSessions = useCallback(
    async (programId: number, selectedBatchId: number) => {
      const response = await apiClient.admin.programs.batches.sessions.list(
        programId,
        selectedBatchId,
      );
      setSessions(unwrap<ProgramSession>(response.data));
    },
    [],
  );

  useEffect(() => {
    if (!open || !program) return;
    setLoading(true);
    const mentorRequest = canManageMentors
      ? apiClient.admin.programs.mentorOptions()
      : Promise.resolve({ data: [] as MentorOption[] });
    void Promise.all([
      apiClient.admin.programs.batches.list(program.id),
      mentorRequest,
    ])
      .then(async ([batchResponse, mentorResponse]) => {
        const loaded = unwrap<ProgramBatch>(batchResponse.data);
        setBatches(loaded);
        setMentorOptions(mentorResponse.data ?? []);
        const first = loaded[0]?.id ?? null;
        setBatchId(first);
        if (first) await loadSessions(program.id, first);
      })
      .catch((error) =>
        alertActions.error(
          "Delivery gagal dimuat",
          getErrorMessage(error, "Batch, sesi, atau mentor tidak tersedia."),
        ),
      )
      .finally(() => setLoading(false));
  }, [canManageMentors, loadSessions, open, program]);

  const chooseBatch = async (value: string) => {
    if (!program) return;
    const id = Number(value);
    setBatchId(id);
    setLoading(true);
    try {
      await loadSessions(program.id, id);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (session?: ProgramSession) => {
    setSelected(session ?? null);
    setTitle(session?.title ?? "");
    setStartsAt(session?.starts_at.slice(0, 16) ?? "");
    setEndsAt(session?.ends_at.slice(0, 16) ?? "");
    setMode(session?.mode ?? "ONLINE");
    setMentorMode(session?.mentor_assignment_mode ?? "ADMIN");
    setLocation(session?.location ?? "");
    setMeetingUrl(session?.meeting_url ?? "");
    setCapacity(session?.capacity ? String(session.capacity) : "");
    setEditing(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!program || !batchId) return;
    const payload: ProgramSessionPayload = {
      title: title.trim(),
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: "Asia/Makassar",
      mode,
      mentor_assignment_mode: mentorMode,
      location: location.trim() || null,
      meeting_url: meetingUrl.trim() || null,
      capacity: capacity ? Number(capacity) : null,
      ...(selected
        ? { reason: "Memperbarui sesi melalui administrasi Program" }
        : {}),
    };
    setLoading(true);
    try {
      if (selected)
        await apiClient.admin.programs.batches.sessions.update(
          program.id,
          batchId,
          selected.id,
          payload,
        );
      else
        await apiClient.admin.programs.batches.sessions.create(
          program.id,
          batchId,
          payload,
        );
      await loadSessions(program.id, batchId);
      setEditing(false);
      alertActions.success(
        "Sesi tersimpan",
        `${payload.title} berhasil diperbarui.`,
      );
    } catch (error) {
      alertActions.error(
        "Sesi gagal disimpan",
        getErrorMessage(error, "Periksa waktu, mode, dan lokasi sesi."),
      );
    } finally {
      setLoading(false);
    }
  };

  const remove = async (session: ProgramSession) => {
    if (
      !program ||
      !batchId ||
      !window.confirm(`Hapus sesi draft ${session.title}?`)
    )
      return;
    try {
      await apiClient.admin.programs.batches.sessions.remove(
        program.id,
        batchId,
        session.id,
      );
      await loadSessions(program.id, batchId);
    } catch (error) {
      alertActions.error(
        "Sesi gagal dihapus",
        getErrorMessage(error, "Hanya sesi draft kosong yang dapat dihapus."),
      );
    }
  };

  const schedule = async (session: ProgramSession) => {
    if (!program || !batchId) return;
    try {
      await apiClient.admin.programs.batches.sessions.transition(
        program.id,
        batchId,
        session.id,
        "SCHEDULED",
        "Menjadwalkan sesi melalui administrasi Program",
      );
      await loadSessions(program.id, batchId);
    } catch (error) {
      alertActions.error(
        "Sesi gagal dijadwalkan",
        getErrorMessage(error, "Status sesi tidak dapat diubah."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-4xl overflow-y-auto border border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Batch & sesi · {program?.name}</DialogTitle>
          <DialogDescription className="sr-only">Pengaturan jadwal batch dan sesi belajar program</DialogDescription>
        </DialogHeader>
        {batches.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
            Buat Batch melalui editor Program sebelum menambahkan sesi.
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid min-w-64 gap-2">
                <Label htmlFor="delivery-batch" className="text-foreground">Batch</Label>
                <Select
                  value={batchId ? String(batchId) : undefined}
                  onValueChange={(value) => void chooseBatch(value)}
                >
                  <SelectTrigger id="delivery-batch" className="h-10 bg-background/70 border-input/60 text-foreground">
                    <SelectValue placeholder="Pilih Batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 border-border/60">
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={String(batch.id)}>
                        {batch.name} · {batch.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => openForm()} disabled={!batchId} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs">
                <Plus className="mr-2 size-4" />
                Tambah sesi
              </Button>
            </div>
            {editing && (
              <form
                onSubmit={submit}
                className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-5 md:grid-cols-2"
              >
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="session-title" className="text-foreground">Judul sesi</Label>
                  <Input
                    id="session-title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-start" className="text-foreground">Mulai</Label>
                  <Input
                    id="session-start"
                    required
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-end" className="text-foreground">Selesai</Label>
                  <Input
                    id="session-end"
                    required
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-mode" className="text-foreground">Mode delivery</Label>
                  <Select
                    value={mode}
                    onValueChange={(value) => setMode(value as BatchMode)}
                  >
                    <SelectTrigger id="session-mode" className="h-10 bg-background/70 border-input/60 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 border-border/60">
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mentor-assignment-mode" className="text-foreground">
                    Penetapan mentor
                  </Label>
                  <Select
                    value={mentorMode}
                    onValueChange={(value) =>
                      setMentorMode(value as MentorMode)
                    }
                  >
                    <SelectTrigger id="mentor-assignment-mode" className="h-10 bg-background/70 border-input/60 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 border-border/60">
                      <SelectItem value="ADMIN">Ditentukan admin</SelectItem>
                      <SelectItem value="STUDENT">Dipilih peserta</SelectItem>
                      <SelectItem value="HYBRID">
                        Peserta memilih shortlist admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-capacity" className="text-foreground">Kapasitas</Label>
                  <Input
                    id="session-capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session-location" className="text-foreground">Lokasi</Label>
                  <Input
                    id="session-location"
                    required={mode !== "ONLINE"}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="session-url" className="text-foreground">Meeting URL</Label>
                  <Input
                    id="session-url"
                    type="url"
                    required={mode !== "OFFLINE"}
                    value={meetingUrl}
                    onChange={(event) => setMeetingUrl(event.target.value)}
                    className="h-10 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs"
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-11 sm:min-h-10 text-xs font-medium">
                    {loading ? "Menyimpan…" : "Simpan sesi"}
                  </Button>
                </div>
              </form>
            )}
            <div className="grid gap-4">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <CalendarDays
                        className="mt-1 size-5 text-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{session.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(session.starts_at).toLocaleString("id-ID")}{" "}
                          · {session.mode} · mentor{" "}
                          {session.mentor_assignment_mode.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{session.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${session.title}`}
                        onClick={() => openForm(session)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      {session.status === "DRAFT" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void schedule(session)}
                            className="text-xs"
                          >
                            Jadwalkan
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Hapus ${session.title}`}
                            onClick={() => void remove(session)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {canManageMentors && program && batchId && (
                    <ProgramMentorAssignments
                      programId={program.id}
                      batchId={batchId}
                      session={session}
                      mentorOptions={mentorOptions}
                      onChanged={() => loadSessions(program.id, batchId)}
                    />
                  )}
                </article>
              ))}
              {sessions.length === 0 && !loading && (
                <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
                  Belum ada sesi pada Batch ini.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
