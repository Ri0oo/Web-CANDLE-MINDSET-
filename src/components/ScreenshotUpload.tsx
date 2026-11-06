import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, HelpCircle, X, CheckCircle } from 'lucide-react';

interface ScreenshotUploadProps {
  imagePreview: string | null;
  imageFileName: string | null;
  onImageSelected: (dataUrl: string, fileName: string, mimeType: string) => void;
  onImageRemoved: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  imagePreview,
  imageFileName,
  onImageSelected,
  onImageRemoved,
  isAnalyzing,
  errorMessage,
  onClearError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const referenceImagePath = '/assets/aistudio/Screenshot_2026-11-06-17-39-05-35_40deb401b9ffe8e1df2f1cc5ba480b12_dd0f56a4.jpg';

  const processFile = (file: File) => {
    onClearError();
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('INVALID IMAGE FORMAT. Please upload a PNG, JPG, or JPEG file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Image file size exceeds 25MB limit. Please upload an optimized screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, file.name, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isAnalyzing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseReference = () => {
    onClearError();
    setShowReferenceModal(false);
    onImageSelected(referenceImagePath, 'Quotex_USD_INR_Reference.jpg', 'image/jpeg');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4">
      <div className="liquid-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl transition-all">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                UPLOAD QUOTEX SCREENSHOT
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Upload your trading chart screenshot to generate an AI signal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowReferenceModal(true)}
              className="px-2 py-1 text-xs rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1"
              title="View required screenshot format"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-terminal text-[11px]">Format Guide</span>
            </button>

            {imagePreview && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1 disabled:opacity-50"
                  title="Replace screenshot"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Replace</span>
                </button>
                <button
                  type="button"
                  onClick={onImageRemoved}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 text-xs rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 border border-red-500/30 transition flex items-center gap-1 disabled:opacity-50"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Strict format notice banner */}
        <div className="mb-3 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-terminal">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span>Format: Quotex mobile chart with candlesticks & Buy/Sell panel</span>
          </div>
          <button
            type="button"
            onClick={() => setShowReferenceModal(true)}
            className="text-cyan-400 hover:underline shrink-0 font-medium"
          >
            See Example
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />

        {/* Upload Zone / Preview Area */}
        {!imagePreview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-all p-6 sm:p-8 flex flex-col items-center justify-center text-center group ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                : 'border-slate-700/60 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
              <UploadCloud className="w-7 h-7 stroke-[2]" />
            </div>

            <p className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-cyan-300 transition">
              Tap or drag & drop to choose screenshot
            </p>
            <p className="text-xs text-slate-400 font-medium max-w-xs mb-3">
              Must be a real Quotex chart screenshot (non-chart images will not receive a signal)
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30">
              <span>Select from Gallery</span>
            </span>
          </div>
        ) : (
          /* Uploaded Screenshot Preview */
          <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950/80 shadow-inner group">
            <div className="relative max-h-72 w-full flex items-center justify-center overflow-hidden bg-black/60">
              <img
                src={imagePreview}
                alt="Quotex chart screenshot"
                className="max-h-72 w-full object-contain"
              />

              {/* Scanning Overlay line during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scanline" />
                  <div className="absolute inset-0 bg-cyan-500/5 backdrop-brightness-110" />
                </div>
              )}
            </div>

            {/* Bottom info pill on preview */}
            <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-terminal">
              <span className="truncate max-w-[220px] text-slate-300 font-medium">
                📄 {imageFileName || 'quotex_screenshot.png'}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SCREENSHOT READY
              </span>
            </div>
          </div>
        )}

        {/* Inline error indicator if any */}
        {errorMessage && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold tracking-wide text-red-300 mb-1">
                SCREENSHOT REJECTED
              </div>
              <div className="text-red-200 text-xs leading-relaxed">
                {errorMessage}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Format Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="liquid-glass rounded-2xl max-w-sm w-full p-5 border border-cyan-500/40 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowReferenceModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white font-terminal uppercase tracking-wider mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Required Quotex Screenshot</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-terminal mb-3">
              Trading signals will only be given for screenshots matching this format:
            </p>

            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/80 max-h-80 flex items-center justify-center mb-4">
              <img
                src={referenceImagePath}
                alt="Required Quotex format"
                className="max-h-80 object-contain"
              />
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-terminal mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Shows candlesticks (green & red)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Shows asset name (e.g. USD/INR)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Shows Buy & Sell buttons at bottom</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseReference}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider font-terminal hover:from-cyan-400 hover:to-indigo-500 shadow-lg"
            >
              Load This Example Screenshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
