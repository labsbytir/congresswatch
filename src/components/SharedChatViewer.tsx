import React, { useState } from 'react';

export interface SourceCitation {
  id: string;
  sourceName: string;
  sourceUrl: string;
  extractedSection?: string;
  retrievedAt: string;
}

export interface SharedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: SourceCitation[];
  createdAt: string;
}

export interface SharedChatViewerProps {
  shareId: string;
  title: string;
  messages: SharedMessage[];
  hasPassword?: boolean;
  currentUser?: { id: string; email: string } | null;
}

export const SharedChatViewer: React.FC<SharedChatViewerProps> = ({
  shareId,
  title,
  messages,
  hasPassword = false,
  currentUser = null
}) => {
  const [activeSources, setActiveSources] = useState<SourceCitation[]>(
    messages.flatMap(m => m.citations || [])
  );
  const [inputQuery, setInputQuery] = useState('');

  const handleContinueConversation = () => {
    if (!currentUser) {
      // Redirect to WorkOS sign-in with return URL
      window.location.href = `/auth/login?redirect_to=${encodeURIComponent(`/chat/fork/${shareId}?q=${encodeURIComponent(inputQuery)}`)}`;
    } else {
      // Fork chat into user's own workspace and open conversational drawer
      window.location.href = `/chat/fork/${shareId}?q=${encodeURIComponent(inputQuery)}`;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-satoshi overflow-hidden">
      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col h-full border-r border-neutral-800">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-black">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Shared Research Session</span>
            <h1 className="text-lg font-bold text-neutral-100">{title}</h1>
          </div>
          <span className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full">
            Frozen Snapshot
          </span>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-neutral-500 mb-1">
                {msg.role === 'user' ? 'User Question' : 'CongressWatch AI'}
              </div>
              <div className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
              }`}>
                {msg.content}

                {/* Inline Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap gap-2">
                    <span className="text-xs text-neutral-400">Sources:</span>
                    {msg.citations.map((cite, idx) => (
                      <a
                        key={cite.id}
                        href={cite.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        [{idx + 1}] {cite.sourceName} ({cite.extractedSection || 'Record'})
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Fork / Chat Input */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a follow-up question to continue this conversation..."
              className="flex-1 bg-black border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleContinueConversation}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0"
            >
              {currentUser ? 'Continue Chat' : 'Sign In to Continue'}
            </button>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-2">
            Continuing this chat creates an independent workspace copy with the full prior context.
          </p>
        </div>
      </div>

      {/* Right Sidebar: Grounding Sources & Provenance */}
      <aside className="w-80 h-full bg-black border-l border-neutral-800 p-6 flex flex-col overflow-y-auto">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
          <span>🏛️ Grounding Sources ({activeSources.length})</span>
        </h2>
        <div className="space-y-4">
          {activeSources.map((source, idx) => (
            <div key={source.id || idx} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
              <div className="font-semibold text-white mb-1">{source.sourceName}</div>
              {source.extractedSection && (
                <div className="text-neutral-400 mb-2 font-mono text-[11px] bg-neutral-950 p-1 rounded">
                  {source.extractedSection}
                </div>
              )}
              <div className="text-neutral-500 text-[10px] mb-2">
                Retrieved: {new Date(source.retrievedAt).toLocaleString()}
              </div>
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all inline-block"
              >
                View Official Source Record ↗
              </a>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

