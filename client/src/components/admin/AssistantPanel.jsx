import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { HiOutlineSparkles, HiOutlineX, HiOutlineArrowsExpand } from 'react-icons/hi';
import AssistantChat from './AssistantChat';

/**
 * AssistantPanel — the assistant as a slide-over, so a question can be asked
 * from any admin page without losing the page you were on.
 */
const AssistantPanel = ({ isOpen, onClose }) => {
  // Escape closes it, and the page behind must not scroll while it is open
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previous
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Close assistant"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] border-none cursor-pointer animate-fade-in"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white border-l border-neutral-200 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="h-16 border-b border-neutral-200 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <HiOutlineSparkles className="w-5 h-5 text-black" />
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-wider text-black leading-none">Assistant</h2>
              <p className="text-[10px] text-neutral-400 font-semibold mt-1 leading-none">
                Reads your data, proposes changes you confirm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/admin/assistant"
              onClick={onClose}
              title="Open full page"
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-all"
            >
              <HiOutlineArrowsExpand className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-all cursor-pointer bg-transparent border-none"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <AssistantChat compact autoFocus />
        </div>
      </div>
    </div>
  );
};

export default AssistantPanel;
