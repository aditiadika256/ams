'use client';

import { useEffect, useState } from 'react';
import {
  Database,
  Server,
  Zap,
  RotateCw,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';

interface TableStat {
  table_name: string;
  row_count: number;
  status: string;
}

interface MaintenanceLog {
  id: number;
  action: string;
  execution_time_ms: number;
  status: string;
  output_details: any;
  triggered_user?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function DatabaseManagerView() {
  const [engine, setEngine] = useState('PostgreSQL (Cloud Aiven)');
  const [tables, setTables] = useState<TableStat[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.databaseManager.getMetrics();
      if (res?.data) {
        setEngine(res.data.engine || 'PostgreSQL');
        setTables(res.data.tables || []);
        setLogs(res.data.recent_logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch database metrics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleAction = async (action: string) => {
    setIsExecutingAction(action);
    try {
      const res = await apiService.databaseManager.executeAction(action);
      alert(res?.message || 'Aksi pemeliharaan database berhasil dijalankan!');
      await fetchMetrics();
    } catch (err: any) {
      alert(err.message || 'Gagal menjalankan aksi pemeliharaan database');
    } finally {
      setIsExecutingAction(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Database className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Database Manager & Maintenance
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  PostgreSQL Cloud
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Inspeksi kesehatan tabel basis data, pembersihan cache usang, dan pencadangan snapshot
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetrics}
          disabled={isLoading}
          className="text-xs h-9 bg-card/60 backdrop-blur-md border-border/40 hover:bg-card/90"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Segarkan
        </Button>
      </div>

      {/* Quick Action Control Bar */}
      <div className="p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="size-4 text-primary" /> Pemeliharaan Rutin Server
          </div>
          <div className="text-[11px] text-muted-foreground">
            Jalankan pembersihan berkala untuk mengoptimalkan latensi kueri database
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('clear_cache')}
            disabled={isExecutingAction !== null}
            className="text-xs h-8 bg-card hover:bg-card/80 border-border/40"
          >
            <RotateCw className={`size-3 mr-1.5 ${isExecutingAction === 'clear_cache' ? 'animate-spin' : ''}`} />
            Bersihkan Cache
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('reindex_transactions')}
            disabled={isExecutingAction !== null}
            className="text-xs h-8 bg-card hover:bg-card/80 border-border/40"
          >
            <Zap className={`size-3 mr-1.5 ${isExecutingAction === 'reindex_transactions' ? 'animate-spin' : ''}`} />
            Re-indeks Transaksi
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('vacuum_analyze')}
            disabled={isExecutingAction !== null}
            className="text-xs h-8 bg-card hover:bg-card/80 border-border/40"
          >
            <HardDrive className={`size-3 mr-1.5 ${isExecutingAction === 'vacuum_analyze' ? 'animate-spin' : ''}`} />
            Vacuum Analyze
          </Button>

          <Button
            size="sm"
            onClick={() => handleAction('backup_snapshot')}
            disabled={isExecutingAction !== null}
            className="text-xs h-8 bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm"
          >
            <FileCheck className="size-3 mr-1.5" />
            Buat Snapshot Backup
          </Button>
        </div>
      </div>

      {/* Table Health Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Server className="size-4 text-primary" /> Status Tabel Utama Basis Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tables.map((t) => (
            <div
              key={t.table_name}
              className="p-3.5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-md flex items-center justify-between"
            >
              <div>
                <div className="font-mono font-semibold text-xs text-foreground truncate max-w-[140px]">
                  {t.table_name}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground font-mono">{t.row_count.toLocaleString()}</span> Baris Data
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-[9px] ${
                  t.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {t.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Maintenance Logs Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Clock className="size-4 text-primary" /> Riwayat Log Pemeliharaan
        </h2>

        <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/40">
                <tr>
                  <th className="px-4 py-3">Waktu Eksekusi</th>
                  <th className="px-4 py-3">Aksi Pemeliharaan</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Hasil / Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Belum ada log pemeliharaan database tercatat.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-primary">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {log.execution_time_ms} ms
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {log.triggered_user?.name || 'Sistem Otomatis'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground max-w-xs truncate">
                        {log.output_details?.message || JSON.stringify(log.output_details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
