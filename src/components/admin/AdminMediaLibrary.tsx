import React, { useState, useRef } from 'react';
import { uploadMediaToCloud } from '../../lib/firebase';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  uploadedAt: string;
  sizeKb?: number;
}

const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'Techie Teacher Tribe Brand Logo',
    url: '/src/assets/images/brand_logo_circle_1793717855663.png',
    type: 'image',
    uploadedAt: '2026-11-12'
  },
  {
    id: 'asset-2',
    name: 'Founder Portrait - Ajay "Techie" Kalki',
    url: '/assets/aistudio/Founder_photo_94b319e5.png',
    type: 'image',
    uploadedAt: '2026-11-12'
  },
  {
    id: 'asset-3',
    name: 'Web Administrator - Aniruddh Trivedi',
    url: '/assets/aistudio/Aniruddh_photo_47ab7886.png',
    type: 'image',
    uploadedAt: '2026-11-12'
  },
  {
    id: 'asset-4',
    name: 'Content Researcher - Aryan Yadav',
    url: '/public/assets/aistudio/WhatsApp_Image_2026-11-12_at_13.57.50_756694f5.jpeg',
    type: 'image',
    uploadedAt: '2026-11-12'
  },
  {
    id: 'asset-5',
    name: 'Campus Library Hall BW',
    url: '/src/assets/images/tribe_campus_bw_1793717857750.jpg',
    type: 'image',
    uploadedAt: '2026-11-12'
  },
  {
    id: 'asset-6',
    name: 'Study Desk Flatlay BW',
    url: '/src/assets/images/student_desk_bw_1793717857911.jpg',
    type: 'image',
    uploadedAt: '2026-11-12'
  }
];

export const AdminMediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_media_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MEDIA_ASSETS;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const saveAssets = (next: MediaAsset[]) => {
    setAssets(next);
    try {
      localStorage.setItem('tttt_media_assets', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const isImg = file.type.startsWith('image/');
      let cloudUrl: string | null = null;
      try {
        cloudUrl = await uploadMediaToCloud(file, 'media-library');
      } catch (err) {
        console.warn('Storage upload error:', err);
      }

      const finalUrl =
        cloudUrl && cloudUrl.startsWith('http')
          ? cloudUrl
          : isImg
          ? URL.createObjectURL(file)
          : `https://teacherstribe.in/docs/${file.name}`;

      const newAsset: MediaAsset = {
        id: `media-${Date.now()}`,
        name: file.name,
        url: finalUrl,
        type: isImg ? 'image' : 'document',
        uploadedAt: new Date().toISOString().split('T')[0],
        sizeKb: Math.round(file.size / 1024)
      };

      saveAssets([newAsset, ...assets]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDeleteAsset = (id: string) => {
    saveAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
            CENTRALIZED ASSET REPOSITORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
            Media &amp; Document Library ({assets.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Upload images, faculty portraits, notes PDFs, and diagrams. Permanent cloud URLs can be pasted into courses or teacher profiles.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-3 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Uploading to Cloud...' : 'Upload Media File'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-950 border border-red-500 text-red-200 text-xs font-mono-numbers flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const isCopied = copiedId === asset.id;

          return (
            <div
              key={asset.id}
              className="bg-zinc-950 border-2 border-zinc-800 p-4 flex flex-col justify-between hover:border-zinc-500 transition-colors"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="aspect-video w-full bg-black border border-zinc-800 mb-3 overflow-hidden flex items-center justify-center relative">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <FileText className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                        Document / Notes
                      </span>
                    </div>
                  )}
                </div>

                <div className="font-heading font-black text-sm uppercase text-white line-clamp-1">
                  {asset.name}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono-numbers text-zinc-500 mt-1">
                  <span>Uploaded {asset.uploadedAt}</span>
                  {asset.sizeKb && <span>{asset.sizeKb} KB</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset)}
                  className={`px-3 py-1.5 text-xs font-mono-numbers font-bold uppercase transition-colors border flex items-center gap-1.5 ${
                    isCopied
                      ? 'border-emerald-400 bg-emerald-500 text-black'
                      : 'border-zinc-700 bg-black text-zinc-300 hover:border-white hover:text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove from media library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
