"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { MentorOption, ProgramSession } from "@/types/sales";

interface Props {
  programId: number;
  batchId: number;
  session: ProgramSession;
  mentorOptions: MentorOption[];
  onChanged: () => Promise<void>;
}

export function ProgramMentorAssignments({
  programId,
  batchId,
  session,
  mentorOptions,
  onChanged,
}: Props) {
  const [mentorId, setMentorId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const activeIds = new Set(
    (session.mentor_assignments ?? []).map(
      (assignment) => assignment.mentor_id,
    ),
  );
  const available = mentorOptions.filter((mentor) => !activeIds.has(mentor.id));
  const canAssign = ["SCHEDULED", "ONGOING"].includes(session.status);

  const assign = async () => {
    if (!mentorId) return;
    setSaving(true);
    try {
      await apiClient.admin.programs.batches.sessions.assignMentor(
        programId,
        batchId,
        session.id,
        Number(mentorId),
        capacity ? Number(capacity) : null,
      );
      setMentorId("");
      setCapacity("");
      await onChanged();
      alertActions.success(
        "Mentor ditetapkan",
        "Shortlist mentor dan kapasitas sesi telah diperbarui.",
      );
    } catch (error) {
      alertActions.error(
        "Mentor gagal ditetapkan",
        getErrorMessage(
          error,
          "Periksa eligibility, kapasitas, dan konflik jadwal mentor.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const end = async (assignmentId: number) => {
    setSaving(true);
    try {
      await apiClient.admin.programs.batches.sessions.endMentorAssignment(
        programId,
        batchId,
        session.id,
        assignmentId,
      );
      await onChanged();
      alertActions.success(
        "Assignment diakhiri",
        "Reservasi aktif dilepas dan histori assignment dipertahankan.",
      );
    } catch (error) {
      alertActions.error(
        "Assignment gagal diakhiri",
        getErrorMessage(error, "Assignment tidak dapat diubah."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 grid gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <div className="flex flex-wrap gap-2">
        {(session.mentor_assignments ?? []).map((assignment) => (
          <Badge
            key={assignment.id}
            variant="secondary"
            className="min-h-8 gap-2 pl-3"
          >
            <span>
              {assignment.mentor.name}
              {assignment.capacity
                ? ` · ${assignment.reserved_count}/${assignment.capacity}`
                : ""}
            </span>
            <button
              type="button"
              aria-label={`Akhiri assignment ${assignment.mentor.name}`}
              disabled={saving}
              onClick={() => void end(assignment.id)}
              className="grid size-6 place-items-center rounded-full hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-zinc-700"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </Badge>
        ))}
        {!session.mentor_assignments?.length && (
          <span className="text-sm text-zinc-500">Belum ada mentor aktif.</span>
        )}
      </div>
      {canAssign ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor={`mentor-${session.id}`}>Tambah mentor</Label>
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger id={`mentor-${session.id}`}>
                <SelectValue placeholder="Pilih mentor aktif" />
              </SelectTrigger>
              <SelectContent>
                {available.map((mentor) => (
                  <SelectItem key={mentor.id} value={String(mentor.id)}>
                    {mentor.name}
                    {mentor.specialization ? ` · ${mentor.specialization}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`mentor-capacity-${session.id}`}>Kapasitas</Label>
            <Input
              id={`mentor-capacity-${session.id}`}
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="Tanpa batas"
            />
          </div>
          <Button
            type="button"
            disabled={!mentorId || saving}
            onClick={() => void assign()}
          >
            <UserPlus className="mr-2 size-4" aria-hidden="true" />
            Tetapkan
          </Button>
        </div>
      ) : (
        <p className="text-sm text-zinc-500" role="status">
          Mentor baru hanya dapat ditetapkan pada sesi terjadwal atau
          berlangsung. Assignment aktif tetap dapat diakhiri.
        </p>
      )}
    </div>
  );
}
