'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  Video as VideoIcon,
  Music,
  Image as ImageIcon,
  HardDrive,
  Cloud,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Archive,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  resolveMediaViewerData,
  formatBytes,
  type MediaViewerData,
  type SupportedMediaAsset,
} from '@/lib/media';

interface MediaContentViewerProps {
  title?: string;
  externalUrl?: string | null;
  mediaAsset?: SupportedMediaAsset | null;
  className?: string;
  defaultHeight?: number | string;
  showDownloadButton?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export function MediaContentViewer({
  title,
  externalUrl,
  mediaAsset,
  className = '',
  defaultHeight = 620,
  showDownloadButton = true,
  onDownload,
  isDownloading = false,
}: MediaContentViewerProps) {
  const viewerData: MediaViewerData = resolveMediaViewerData({
    title,
    externalUrl,
    mediaAsset,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    setImageZoom(1);
  }, [viewerData.previewUrl]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        void containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-zinc-950' : ''
      } ${className}`}
    >
      {/* Glass Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-white/40 px-4 py-3 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-primary/10 text-primary dark:border-white/10 dark:bg-primary/20">
            {viewerData.kind === 'google_drive' && <HardDrive className="size-4 text-blue-500" />}
            {viewerData.kind === 'pdf' && <FileText className="size-4 text-red-500" />}
            {viewerData.kind === 'video' && <VideoIcon className="size-4 text-purple-500" />}
            {viewerData.kind === 'audio' && <Music className="size-4 text-amber-500" />}
            {viewerData.kind === 'image' && <ImageIcon className="size-4 text-emerald-500" />}
            {viewerData.kind === 'office' && (
              viewerData.subType === 'excel' ? <FileSpreadsheet className="size-4 text-emerald-600" /> :
              viewerData.subType === 'powerpoint' ? <Presentation className="size-4 text-amber-600" /> :
              <FileText className="size-4 text-blue-600" />
            )}
            {viewerData.kind === 'text' && <FileCode className="size-4 text-cyan-500" />}
            {viewerData.kind === 'archive' && <Archive className="size-4 text-indigo-500" />}
            {viewerData.kind === 'download_only' && <Cloud className="size-4" />}
            {viewerData.kind === 'external_link' && <ExternalLink className="size-4" />}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100 sm:text-sm">
              {viewerData.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Badge
                variant="secondary"
                className="h-4 border border-white/20 bg-white/50 px-1.5 text-[10px] font-medium text-zinc-700 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                {viewerData.badgeLabel}
              </Badge>
              {viewerData.sizeBytes ? (
                <span>· {formatBytes(viewerData.sizeBytes)}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {viewerData.previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setIframeError(false);
              }}
              title="Muat Ulang Pratinjau"
              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}

          {/* Open in New Tab Button */}
          {(viewerData.previewUrl || viewerData.downloadUrl) && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-white/20 bg-white/60 text-xs font-medium text-zinc-700 backdrop-blur-sm hover:bg-white hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <a
                href={viewerData.previewUrl || viewerData.downloadUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Buka di Tab Baru</span>
              </a>
            </Button>
          )}

          {/* Download button */}
          {showDownloadButton && viewerData.downloadUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDownloading}
              onClick={() => {
                if (onDownload) {
                  onDownload();
                } else if (viewerData.downloadUrl) {
                  window.open(viewerData.downloadUrl, '_blank');
                }
              }}
              className="h-8 gap-1.5 border-white/20 bg-white/60 text-xs font-medium text-zinc-700 backdrop-blur-sm hover:bg-white hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">
                {isDownloading ? 'Mengunduh...' : 'Unduh'}
              </span>
            </Button>
          )}

          {/* Fullscreen Button */}
          {viewerData.isEmbeddable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div
        className="relative flex-1 bg-zinc-100/50 dark:bg-zinc-950/60"
        style={{ height: isFullscreen ? 'calc(100vh - 58px)' : defaultHeight }}
      >
        {/* Loading Spinner */}
        {isLoading && viewerData.isEmbeddable && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md dark:bg-zinc-950/50">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Memuat pratinjau materi...
            </p>
          </div>
        )}

        {/* 1. Google Drive Viewer */}
        {viewerData.kind === 'google_drive' && viewerData.previewUrl && (
          <div className="h-full w-full">
            <iframe
              src={viewerData.previewUrl}
              title={viewerData.title}
              className="h-full w-full border-0 bg-white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          </div>
        )}

        {/* 2. PDF Viewer */}
        {viewerData.kind === 'pdf' && viewerData.previewUrl && (
          <div className="h-full w-full">
            <object
              data={`${viewerData.previewUrl}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="h-full w-full bg-white"
              onLoad={() => setIsLoading(false)}
            >
              {/* Fallback iframe if object element cannot render PDF */}
              <iframe
                src={`${viewerData.previewUrl}#toolbar=1&navpanes=0`}
                title={viewerData.title}
                className="h-full w-full border-0 bg-white"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setIframeError(true);
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <FileText className="size-12 text-zinc-400 mb-2" />
                  <p className="text-sm font-semibold">Browser tidak mendukung pratinjau PDF langsung.</p>
                  <Button asChild className="mt-4">
                    <a href={viewerData.downloadUrl || viewerData.previewUrl} target="_blank" rel="noopener noreferrer">
                      Buka Dokumen PDF
                    </a>
                  </Button>
                </div>
              </iframe>
            </object>
          </div>
        )}

        {/* 3. Cloudflare CDN Video Player */}
        {viewerData.kind === 'video' && viewerData.previewUrl && (
          <div className="flex h-full w-full items-center justify-center bg-black">
            <video
              src={viewerData.previewUrl}
              controls
              playsInline
              className="max-h-full max-w-full"
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            >
              Browser Anda tidak mendukung pemutar video HTML5.
            </video>
          </div>
        )}

        {/* 4. Audio Player */}
        {viewerData.kind === 'audio' && viewerData.previewUrl && (
          <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-primary/10 text-primary backdrop-blur-md">
              <Music className="size-8" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{viewerData.title}</h4>
            <p className="mb-6 text-xs text-zinc-500">Pemutar Audio Materi</p>
            <audio
              src={viewerData.previewUrl}
              controls
              className="w-full max-w-md"
              onLoadedData={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* 5. Image Viewer with Zoom Controls */}
        {viewerData.kind === 'image' && viewerData.previewUrl && (
          <div className="relative flex h-full w-full items-center justify-center overflow-auto p-4 bg-zinc-950/5 dark:bg-zinc-950/50">
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-xl border border-white/20 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70">
              <button
                type="button"
                onClick={() => setImageZoom((prev) => Math.min(prev + 0.25, 3))}
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Perbesar Gambar"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <span className="px-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 min-w-10 text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setImageZoom((prev) => Math.max(prev - 0.25, 0.5))}
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Perkecil Gambar"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setImageZoom(1)}
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Reset Ukuran"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
            <img
              src={viewerData.previewUrl}
              alt={viewerData.title}
              style={{ transform: `scale(${imageZoom})`, transition: 'transform 0.2s ease-out' }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* 6. Office Documents (Word, Excel, PowerPoint) */}
        {viewerData.kind === 'office' && (
          <div className="h-full w-full flex flex-col items-center justify-center p-6">
            {viewerData.previewUrl && viewerData.previewUrl.startsWith('https://view.officeapps.live.com') ? (
              <iframe
                src={viewerData.previewUrl}
                title={viewerData.title}
                className="h-full w-full border-0 bg-white rounded-lg shadow-inner"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setIframeError(true);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg rounded-2xl border border-white/40 bg-white/60 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60">
                <div
                  className={`mb-3 flex size-16 items-center justify-center rounded-2xl border border-white/20 p-4 shadow-sm backdrop-blur-md ${
                    viewerData.subType === 'excel'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : viewerData.subType === 'powerpoint'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {viewerData.subType === 'excel' ? (
                    <FileSpreadsheet className="size-8" />
                  ) : viewerData.subType === 'powerpoint' ? (
                    <Presentation className="size-8" />
                  ) : (
                    <FileText className="size-8" />
                  )}
                </div>

                <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{viewerData.title}</h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {viewerData.badgeLabel} {viewerData.sizeBytes ? `· ${formatBytes(viewerData.sizeBytes)}` : ''}
                </p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Dokumen Microsoft Office dapat dibuka langsung secara daring melalui Office Online atau diunduh ke komputer lokal.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {viewerData.cdnUrl && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl">
                      <a
                        href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(viewerData.cdnUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" /> Buka di Office Online
                      </a>
                    </Button>
                  )}
                  {viewerData.downloadUrl && (
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 text-xs rounded-xl shadow-sm"
                      onClick={() => {
                        if (onDownload) onDownload();
                        else if (viewerData.downloadUrl) window.open(viewerData.downloadUrl, '_blank');
                      }}
                    >
                      <Download className="size-3.5" /> Unduh Dokumen
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Text & Code Documents */}
        {viewerData.kind === 'text' && viewerData.previewUrl && (
          <div className="h-full w-full p-4">
            <iframe
              src={viewerData.previewUrl}
              title={viewerData.title}
              className="h-full w-full rounded-xl border border-zinc-200 bg-white font-mono text-xs dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-inner"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          </div>
        )}

        {/* 8. Compressed Archive (ZIP/RAR) */}
        {viewerData.kind === 'archive' && (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-indigo-500/10 p-4 text-indigo-600 shadow-sm backdrop-blur-md dark:bg-indigo-950/30 dark:text-indigo-400">
              <Archive className="size-8" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{viewerData.title}</h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <span>Paket Arsip Terkompresi</span>
              {viewerData.sizeBytes && <span>· {formatBytes(viewerData.sizeBytes)}</span>}
            </div>
            <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Arsip berkas zip/rar untuk materi pendukung atau aset praktikum. Unduh dan ekstrak pada komputer lokal.
            </p>
            {viewerData.downloadUrl && (
              <Button
                type="button"
                className="mt-5 gap-2 rounded-xl"
                onClick={() => {
                  if (onDownload) onDownload();
                  else if (viewerData.downloadUrl) window.open(viewerData.downloadUrl, '_blank');
                }}
              >
                <Download className="size-4" /> Unduh Arsip ({formatBytes(viewerData.sizeBytes)})
              </Button>
            )}
          </div>
        )}

        {/* 9. Non-embeddable or Download Only Card */}
        {viewerData.kind === 'download_only' && (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-zinc-100 p-4 text-zinc-500 shadow-sm backdrop-blur-md dark:bg-zinc-900 dark:text-zinc-400">
              <FileText className="size-8 text-primary" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{viewerData.title}</h4>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Berkas ini tersimpan aman pada storage. Anda dapat mengunduh berkas ini untuk membukanya secara lokal.
            </p>
            {viewerData.downloadUrl && (
              <Button
                type="button"
                className="mt-5 gap-2"
                disabled={isDownloading}
                onClick={() => {
                  if (onDownload) onDownload();
                  else if (viewerData.downloadUrl) window.open(viewerData.downloadUrl, '_blank');
                }}
              >
                <Download className="size-4" />
                {isDownloading ? 'Mengunduh...' : 'Unduh Berkas'}
              </Button>
            )}
          </div>
        )}

        {/* Error State Fallback */}
        {iframeError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-md dark:bg-zinc-950/95">
            <AlertCircle className="size-10 text-amber-500 mb-2" />
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pratinjau Tidak Dapat Ditampilkan</h4>
            <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
              {viewerData.kind === 'google_drive'
                ? 'Pastikan berkas Google Drive memiliki izin akses "Siapa saja dengan tautan dapat melihat" (Public/Anyone with link).'
                : 'Berkas tidak mengizinkan pemuatan bingkai (frame) atau koneksi dibatasi.'}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  setIframeError(false);
                }}
              >
                Coba Lagi
              </Button>
              {viewerData.downloadUrl && (
                <Button asChild size="sm">
                  <a href={viewerData.downloadUrl} target="_blank" rel="noopener noreferrer">
                    Buka Langsung <ExternalLink className="ml-1 size-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Glass Bottom Hint Bar (Specifically for Google Drive & PDF notes) */}
      {viewerData.kind === 'google_drive' && (
        <div className="flex items-center gap-2 border-t border-white/10 bg-white/30 px-4 py-2 text-[11px] text-zinc-500 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-400">
          <HardDrive className="size-3.5 text-blue-500 shrink-0" />
          <span className="truncate">
            Pratinjau interaktif Google Drive. Jika pratinjau meminta izin login, pastikan akses file diset ke &quot;Siapa saja yang memiliki tautan&quot;.
          </span>
        </div>
      )}
    </div>
  );
}
