import { apiClient } from '@/lib/api';
import type { WorkspaceMediaAsset } from '@/types/workspace';
import type { MediaAsset } from '@/types/sales';

export type SupportedMediaAsset =
  | WorkspaceMediaAsset
  | MediaAsset
  | {
      id: number;
      original_name: string;
      mime_type: string;
      size_bytes?: number;
      download_url?: string | null;
      view_url?: string | null;
      cdn_url?: string | null;
      extension?: string;
    };

export interface GoogleDriveInfo {
  isGoogleDrive: boolean;
  fileId?: string;
  previewUrl?: string;
  type?: 'file' | 'document' | 'spreadsheets' | 'presentation' | 'folder';
  originalUrl: string;
}

export type MediaViewKind =
  | 'google_drive'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'image'
  | 'external_link'
  | 'download_only';

export interface MediaViewerData {
  kind: MediaViewKind;
  title: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  cdnUrl: string | null;
  badgeLabel: string;
  isEmbeddable: boolean;
  driveInfo?: GoogleDriveInfo;
  mimeType?: string;
  sizeBytes?: number;
}

/**
 * Parses any Google Drive, Docs, Sheets, or Slides link into an embeddable preview URL.
 * Automatically converts /view, /edit, or /open?id= into the iframe-embeddable /preview format.
 */
export function parseGoogleDriveUrl(url: string | null | undefined): GoogleDriveInfo {
  if (!url || typeof url !== 'string') {
    return { isGoogleDrive: false, originalUrl: '' };
  }

  const cleanUrl = url.trim();
  const isDrive =
    cleanUrl.includes('drive.google.com') ||
    cleanUrl.includes('docs.google.com');

  if (!isDrive) {
    return { isGoogleDrive: false, originalUrl: cleanUrl };
  }

  // 1. Google Drive File: /file/d/{id}/view
  const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch?.[1]) {
    const fileId = fileMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      type: 'file',
      originalUrl: cleanUrl,
    };
  }

  // 2. Google Docs Document: /document/d/{id}/edit
  const docMatch = cleanUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch?.[1]) {
    const fileId = docMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://docs.google.com/document/d/${fileId}/preview`,
      type: 'document',
      originalUrl: cleanUrl,
    };
  }

  // 3. Google Spreadsheets: /spreadsheets/d/{id}/edit
  const sheetMatch = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch?.[1]) {
    const fileId = sheetMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://docs.google.com/spreadsheets/d/${fileId}/preview`,
      type: 'spreadsheets',
      originalUrl: cleanUrl,
    };
  }

  // 4. Google Presentation / Slides: /presentation/d/{id}/edit
  const slideMatch = cleanUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slideMatch?.[1]) {
    const fileId = slideMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://docs.google.com/presentation/d/${fileId}/preview`,
      type: 'presentation',
      originalUrl: cleanUrl,
    };
  }

  // 5. Query param id: /open?id={id} or /uc?id={id}
  const queryMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch?.[1]) {
    const fileId = queryMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      type: 'file',
      originalUrl: cleanUrl,
    };
  }

  // 6. Google Drive Folder: /drive/folders/{id}
  const folderMatch = cleanUrl.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) {
    const fileId = folderMatch[1];
    return {
      isGoogleDrive: true,
      fileId,
      previewUrl: `https://drive.google.com/embeddedfolderview?id=${fileId}#list`,
      type: 'folder',
      originalUrl: cleanUrl,
    };
  }

  return { isGoogleDrive: true, originalUrl: cleanUrl };
}

/**
 * Checks if a given URL or file points to a PDF.
 */
export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const pathWithoutQuery = url.split('?')[0].toLowerCase();
  return pathWithoutQuery.endsWith('.pdf') || url.includes('/pdf') || url.includes('type=pdf');
}

/**
 * Resolves full CDN URL from relative path or checks Cloudflare CDN origin.
 */
export function resolveCdnUrl(objectKeyOrUrl: string | null | undefined): string | null {
  if (!objectKeyOrUrl) return null;
  if (objectKeyOrUrl.startsWith('http://') || objectKeyOrUrl.startsWith('https://')) {
    return objectKeyOrUrl;
  }
  const cdnBase = process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL || 'https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev';
  if (cdnBase) {
    return `${cdnBase.replace(/\/+$/, '')}/${objectKeyOrUrl.replace(/^\/+/, '')}`;
  }
  return objectKeyOrUrl;
}

/**
 * Resolve unified media viewer data from an external URL or workspace media asset.
 */
export function resolveMediaViewerData(params: {
  title?: string;
  externalUrl?: string | null;
  mediaAsset?: SupportedMediaAsset | null;
}): MediaViewerData {
  const { title = 'Materi Pembelajaran', externalUrl, mediaAsset } = params;

  // Case 1: Google Drive link in externalUrl
  if (externalUrl) {
    const driveInfo = parseGoogleDriveUrl(externalUrl);
    if (driveInfo.isGoogleDrive && driveInfo.previewUrl) {
      return {
        kind: 'google_drive',
        title,
        previewUrl: driveInfo.previewUrl,
        downloadUrl: externalUrl,
        cdnUrl: null,
        badgeLabel: 'Google Drive Viewer',
        isEmbeddable: true,
        driveInfo,
      };
    }

    // Case 2: External PDF direct link
    if (isPdfUrl(externalUrl)) {
      return {
        kind: 'pdf',
        title,
        previewUrl: externalUrl,
        downloadUrl: externalUrl,
        cdnUrl: null,
        badgeLabel: 'Dokumen PDF Eksternal',
        isEmbeddable: true,
      };
    }
  }

  // Case 3: MediaAsset attached (from Cloudflare R2 / Storage)
  if (mediaAsset) {
    const mime = (mediaAsset.mime_type || '').toLowerCase();
    const originalName = mediaAsset.original_name || '';
    const isPdf = mime.includes('pdf') || originalName.toLowerCase().endsWith('.pdf');
    const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(originalName);
    const isAudio = mime.startsWith('audio/') || /\.(mp3|wav|m4a|ogg)$/i.test(originalName);
    const isImage = mime.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(originalName);

    const cdnUrl = 'cdn_url' in mediaAsset && mediaAsset.cdn_url ? resolveCdnUrl(mediaAsset.cdn_url) : null;
    const downloadUrl =
      ('download_url' in mediaAsset && mediaAsset.download_url)
        ? mediaAsset.download_url
        : mediaAsset.id
          ? `/api/v1/workspace/media-assets/${mediaAsset.id}/download`
          : null;
    const viewUrl = ('view_url' in mediaAsset && mediaAsset.view_url) ? mediaAsset.view_url : null;
    const streamOrViewUrl = viewUrl || (cdnUrl ?? downloadUrl);
    const sizeBytes = 'size_bytes' in mediaAsset && typeof mediaAsset.size_bytes === 'number' ? mediaAsset.size_bytes : undefined;

    if (isPdf) {
      return {
        kind: 'pdf',
        title: originalName || title,
        previewUrl: streamOrViewUrl,
        downloadUrl,
        cdnUrl,
        badgeLabel: cdnUrl ? 'Cloudflare CDN PDF' : 'Dokumen PDF Program',
        isEmbeddable: true,
        mimeType: mediaAsset.mime_type,
        sizeBytes,
      };
    }

    if (isVideo) {
      return {
        kind: 'video',
        title: originalName || title,
        previewUrl: streamOrViewUrl,
        downloadUrl,
        cdnUrl,
        badgeLabel: cdnUrl ? 'Cloudflare CDN Video' : 'Video Pembelajaran',
        isEmbeddable: true,
        mimeType: mediaAsset.mime_type,
        sizeBytes,
      };
    }

    if (isAudio) {
      return {
        kind: 'audio',
        title: originalName || title,
        previewUrl: streamOrViewUrl,
        downloadUrl,
        cdnUrl,
        badgeLabel: cdnUrl ? 'Cloudflare CDN Audio' : 'Audio Pembelajaran',
        isEmbeddable: true,
        mimeType: mediaAsset.mime_type,
        sizeBytes,
      };
    }

    if (isImage) {
      return {
        kind: 'image',
        title: originalName || title,
        previewUrl: streamOrViewUrl,
        downloadUrl,
        cdnUrl,
        badgeLabel: cdnUrl ? 'Cloudflare CDN Gambar' : 'Gambar',
        isEmbeddable: true,
        mimeType: mediaAsset.mime_type,
        sizeBytes,
      };
    }

    return {
      kind: 'download_only',
      title: originalName || title,
      previewUrl: null,
      downloadUrl,
      cdnUrl,
      badgeLabel: cdnUrl ? 'Cloudflare CDN File' : 'Berkas Privat',
      isEmbeddable: false,
      mimeType: mediaAsset.mime_type,
      sizeBytes,
    };
  }

  // Case 4: General external link fallback
  if (externalUrl) {
    return {
      kind: 'external_link',
      title,
      previewUrl: externalUrl,
      downloadUrl: externalUrl,
      cdnUrl: null,
      badgeLabel: 'Tautan Eksternal',
      isEmbeddable: false,
    };
  }

  return {
    kind: 'download_only',
    title,
    previewUrl: null,
    downloadUrl: null,
    cdnUrl: null,
    badgeLabel: 'Materi Belum Terisi',
    isEmbeddable: false,
  };
}

/**
 * Format raw bytes into human readable format (KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Reusable helper to upload a media file to the program media storage / Cloudflare CDN.
 */
export async function uploadMediaToCloudflare(
  programId: number,
  file: File,
  reason = 'Mengunggah materi pembelajaran program ke Cloudflare Storage',
  onProgress?: (percent: number) => void
) {
  return apiClient.admin.mediaAssets.upload(programId, file, reason, onProgress);
}
