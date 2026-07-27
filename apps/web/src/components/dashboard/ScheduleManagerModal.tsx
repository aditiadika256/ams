import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore, MentorSchedule } from '@/store/useLearningStore';
import { X, Calendar, Clock, MapPin, BookOpen, Users, Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/animated-button';

interface ScheduleManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentorId: number;
    existingSchedule?: MentorSchedule | null;
}

const COLORS = [
    { hex: '#0041c2', label: 'Blueberry' },
    { hex: '#EB3C27', label: 'Tomato' },
    { hex: '#228B22', label: 'Basil' },
    { hex: '#fc8eac', label: 'Flaminggo' },
    { hex: '#ffe135', label: 'Banana' },
    { hex: '#f28500', label: 'Tangerine' },
    { hex: '#039BE5', label: 'Peacock' },
    { hex: '#5cda1c', label: 'Sage' },
];

export function ScheduleManagerModal({ isOpen, onClose, mentorId, existingSchedule }: ScheduleManagerModalProps) {
    const { addSchedule, updateSchedule, deleteSchedule } = useLearningStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        location: '',
        status: 'scheduled',
        guest_email: '',
        color_hex: COLORS[0].hex,
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (existingSchedule) {
            const startDt = new Date(existingSchedule.start_time);
            const endDt = new Date(existingSchedule.end_time);

            setFormData({
                title: existingSchedule.title || '',
                description: existingSchedule.description || '',
                subject: existingSchedule.subject || '',
                location: existingSchedule.location || '',
                status: existingSchedule.status || 'scheduled',
                guest_email: existingSchedule.guest_email || '',
                color_hex: existingSchedule.color_hex || COLORS[0].hex,
                date: startDt.toISOString().split('T')[0],
                start_time: startDt.toTimeString().substring(0, 5),
                end_time: endDt.toTimeString().substring(0, 5)
            });
        } else {
            setFormData({
                title: '',
                description: '',
                subject: '',
                location: '',
                status: 'scheduled',
                guest_email: '',
                color_hex: COLORS[0].hex,
                date: new Date().toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '10:00'
            });
        }
    }, [existingSchedule, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Combine date and time
        const start_time = `${formData.date}T${formData.start_time}:00`;
        const end_time = `${formData.date}T${formData.end_time}:00`;

        const payload = {
            ...formData,
            start_time,
            end_time
        };

        try {
            if (existingSchedule) {
                await updateSchedule(mentorId, existingSchedule.id, payload);
            } else {
                await addSchedule(mentorId, payload);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save schedule', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingSchedule || !confirm('Are you sure you want to delete this session?')) return;
        setIsSubmitting(true);
        try {
            await deleteSchedule(mentorId, existingSchedule.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: formData.color_hex }} />

                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-semibold">{existingSchedule ? 'Edit Sesi Mengajar' : 'Buat Sesi Baru'}</h2>
                        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/10 transition">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {/* Title & Subject */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Users className="h-3 w-3" /> Group/Siswa
                                    </label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: PPC2+] 1SMP Athaya"
                                        className="bg-white/5 border-white/10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <BookOpen className="h-3 w-3" /> Mata Pelajaran
                                    </label>
                                    <Input
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Contoh: MTK"
                                        className="bg-white/5 border-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date & Times */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-3 sm:col-span-1 space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Mulai
                                    </label>
                                    <Input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Selesai
                                    </label>
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location & Email */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Lokasi
                                    </label>
                                    <Input
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Rumah Siswa / Zoom"
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Users className="h-3 w-3" /> Email Tamu
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.guest_email}
                                        onChange={e => setFormData({ ...formData, guest_email: e.target.value })}
                                        placeholder="siswa@email.com"
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>

                            {/* Status & Options */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium">Status Sesi</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm focus:outline-[none] focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="scheduled">Scheduled (To Do)</option>
                                        <option value="done">Done</option>
                                        <option value="rescheduled">Rescheduled</option>
                                        <option value="cancelled">Cancelled (Tdk Les)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Palette className="h-3 w-3" /> Warna Label
                                    </label>
                                    <div className="flex gap-2 items-center h-10">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.hex}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color_hex: c.hex })}
                                                className={`w-6 h-6 rounded-full transition-transform ${formData.color_hex === c.hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900 border-0' : 'hover:scale-110 border border-white/20'}`}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground font-medium">Keterangan Tambahan</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm focus:outline-[none] focus:ring-2 focus:ring-primary custom-scrollbar resize-none"
                                    placeholder="Catatan untuk sesi ini..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
                            {existingSchedule ? (
                                <Button type="button" variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={handleDelete} disabled={isSubmitting}>
                                    <Trash2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Hapus</span></Button>
                            ) : (
                                <div /> // Spacer
                            )}

                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Batal</Button>
                                <AnimatedButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </AnimatedButton>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
