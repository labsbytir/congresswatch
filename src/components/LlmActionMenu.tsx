import React, { useState } from 'react';
import { DocumentIcon, ExternalLinkIcon } from './Icons';

export interface LlmActionMenuProps {
  markdownUrl?: string;
  markdownContent?: string;
  title?: string;
  className?: string;
}

export const LlmActionMenu: React.FC<LlmActionMenuProps> = ({
  markdownUrl,
  markdownContent = '',
  title = 'Page Content',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      if (markdownContent) {
        await navigator.clipboard.writeText(markdownContent);
      } else if (markdownUrl) {
        const res = await fetch(markdownUrl);
        const text = await res.text();
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleViewMarkdown = () => {
    if (markdownUrl) {
      window.open(markdownUrl, '_blank');
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Prominent LLM Action Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-neutral-700 hover:border-neutral-500 rounded-lg px-3 py-1.5 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        title="Agentic Engine Optimization (AEO) & LLM Actions"
      >
        <span className="font-mono text-[11px] text-blue-400 font-extrabold px-1 py-0.5 rounded bg-blue-950 border border-blue-800">
          LLM
        </span>
        <span className="font-bold">Agent Export</span>
        <span className="text-neutral-400 text-[10px]">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white border-2 border-neutral-300 shadow-2xl z-50 p-1 text-xs font-semibold animate-in fade-in"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-2 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Agentic & LLM Actions
          </div>

          <button
            onClick={() => {
              handleCopyMarkdown();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-neutral-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2">
              <DocumentIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{copied ? '✓ Copied Markdown!' : 'Copy as Markdown'}</span>
            </span>
            <span className="text-[10px] text-neutral-600 font-mono">⌘C</span>
          </button>

          {markdownUrl && (
            <button
              onClick={() => {
                handleViewMarkdown();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-neutral-800 flex items-center justify-between cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>View as Markdown</span>
              </span>
              <span className="text-[10px] text-neutral-600 font-mono">.md</span>
            </button>
          )}

          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-neutral-800 flex items-center justify-between cursor-pointer transition-colors block border-t border-neutral-100 mt-1"
          >
            <span className="flex items-center gap-2 text-neutral-600">
              <span className="font-mono text-[10px] font-bold bg-neutral-100 px-1 rounded">/llms.txt</span>
              <span>Agent Spec (AEO)</span>
            </span>
            <span className="text-[10px] text-neutral-600 font-mono">↗</span>
          </a>
        </div>
      )}
    </div>
  );
};

