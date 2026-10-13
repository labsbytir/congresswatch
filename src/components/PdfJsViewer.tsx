import React, { useState } from 'react';
import { DocumentIcon, ExternalLinkIcon } from './Icons';

export interface PdfJsViewerProps {
  pdfUrl: string;
  billTitle: string;
  billNumber: string;
}

export const PdfJsViewer: React.FC<PdfJsViewerProps> = ({
  pdfUrl,
  billTitle,
  billNumber
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerMode, setViewerMode] = useState<'native' | 'mozilla'>('native');

  const fullPdfUrl = typeof window !== 'undefined' && !pdfUrl.startsWith('http')
    ? `${window.location.origin}${pdfUrl}`
    : pdfUrl;

  const mozillaViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fullPdfUrl)}`;

  return (
    <div className={`bg-white border-2 border-neutral-300 rounded-2xl shadow-sm overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      {/* Toolbar */}
      <div className="bg-neutral-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <DocumentIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Official Bill PDF Document Viewer
            </div>
            <div className="text-sm font-black text-white truncate max-w-md">
              {billNumber} • {billTitle}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setViewerMode('native')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewerMode === 'native' ? 'bg-blue-600 text-white font-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Native Engine
            </button>
            <button
              onClick={() => setViewerMode('mozilla')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewerMode === 'mozilla' ? 'bg-blue-600 text-white font-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Mozilla PDF.js
            </button>
          </div>

          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 15))}
              className="px-2.5 py-1 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              −
            </button>
            <span className="px-2 font-mono text-neutral-200 tabular-nums">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 15))}
              className="px-2.5 py-1 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 transition-colors cursor-pointer"
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </button>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Download PDF</span>
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* PDF.js Frame */}
      <div className={`w-full bg-neutral-100 relative ${isFullscreen ? 'flex-1 h-[calc(100vh-120px)]' : 'h-[750px]'}`}>
        {viewerMode === 'native' ? (
          <object
            data={fullPdfUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <iframe
              src={fullPdfUrl}
              title={`Document PDF - ${billNumber}`}
              className="w-full h-full border-none"
            />
          </object>
        ) : (
          <iframe
            src={mozillaViewerUrl}
            title={`Mozilla PDF.js Viewer - ${billNumber}`}
            className="w-full h-full border-none"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-neutral-50 px-5 py-2.5 border-t border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
        <span className="font-medium">Streamed via Cloudflare R2 bucket (/watchers/congresswatch/bills/) & GPO repository.</span>
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-700 font-bold hover:underline">
          Open raw original.pdf in new tab ↗
        </a>
      </div>
    </div>
  );
};
