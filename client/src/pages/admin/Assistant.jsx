import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineSparkles, HiOutlineCheck, HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import AdminCommonHead from '../../components/common/adminCommon/AdminCommonHead';
import {
  useGetAgentStatusQuery,
  useAskAgentMutation,
  useConfirmProposalMutation,
  useDeclineProposalMutation,
} from '../../store/api/agentApi';

// Questions that show what the assistant is actually for
const STARTERS = [
  'Which property makes the most profit, and which the least?',
  'What should I do about my worst performer?',
  'When should I run a discount campaign, and on what?',
  'What needs my attention this week?',
];

const Assistant = () => {
  const { data: statusData, isLoading: statusLoading } = useGetAgentStatusQuery();
  const [askAgent, { isLoading: thinking }] = useAskAgentMutation();
  const [confirmProposal, { isLoading: confirming }] = useConfirmProposalMutation();
  const [declineProposal] = useDeclineProposalMutation();

  const status = statusData?.status;
  const [turns, setTurns] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, thinking]);

  const send = async (question) => {
    const text = (question || input).trim();
    if (!text || thinking) return;

    setInput('');
    // Show what was asked straight away, the answer follows
    const history = turns.flatMap((turn) => [
      { role: 'user', text: turn.question },
      ...(turn.answer ? [{ role: 'assistant', text: turn.answer }] : []),
    ]);
    setTurns((prev) => [...prev, { question: text, answer: null, proposals: [] }]);

    try {
      const res = await askAgent({ question: text, history }).unwrap();
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          question: text,
          answer: res.answer || 'No answer came back.',
          proposals: res.proposals || [],
          runId: res.runId,
          reads: res.reads,
        };
        return next;
      });
    } catch (err) {
      const message = err?.data?.message || err?.message || 'The assistant could not answer that.';
      setTurns((prev) => {
        const next = [...prev];
        next[next.length - 1] = { question: text, answer: null, error: message, proposals: [] };
        return next;
      });
      toast.error(message);
    }
  };

  const decide = async (turnIndex, proposalIndex, accept) => {
    const turn = turns[turnIndex];
    if (!turn?.runId) return;

    try {
      const action = accept ? confirmProposal : declineProposal;
      const res = await action({ runId: turn.runId, index: proposalIndex }).unwrap();
      toast.success(res.message || (accept ? 'Change applied' : 'Change declined'));
      setTurns((prev) => {
        const next = [...prev];
        const proposals = [...next[turnIndex].proposals];
        proposals[proposalIndex] = { ...proposals[proposalIndex], status: accept ? 'confirmed' : 'declined' };
        next[turnIndex] = { ...next[turnIndex], proposals };
        return next;
      });
    } catch (err) {
      const message = err?.data?.message || err?.message || 'That change could not be applied';
      toast.error(message);
      setTurns((prev) => {
        const next = [...prev];
        const proposals = [...next[turnIndex].proposals];
        proposals[proposalIndex] = { ...proposals[proposalIndex], status: 'failed', error: message };
        next[turnIndex] = { ...next[turnIndex], proposals };
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div className="border-b border-neutral-200 pb-4">
        <AdminCommonHead
          name="Business Assistant"
          des="Ask about performance, and it proposes changes you confirm"
        />
      </div>

      {/* ====== Not configured ====== */}
      {!statusLoading && status && !status.configured && (
        <div className="bg-amber-50 border border-amber-200 rounded p-5">
          <p className="font-black uppercase text-[11px] tracking-wider text-amber-800">Assistant not configured</p>
          <p className="text-[13px] text-amber-900 font-semibold mt-1.5">
            {status.reason}. Add a free key from{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">
              aistudio.google.com/apikey
            </a>{' '}
            as <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> in the server .env, then restart it.
          </p>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded shadow-xs flex flex-col" style={{ height: 640 }}>
        {/* ====== Conversation ====== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {turns.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <HiOutlineSparkles className="w-10 h-10 text-neutral-300 mb-3" />
              <p className="font-black uppercase text-xs tracking-wider">Ask about your portfolio</p>
              <p className="text-[13px] text-neutral-400 font-semibold mt-1 max-w-md">
                It reads your real bookings and payouts. Anything it wants to change is queued for you to confirm.
              </p>
              <div className="flex flex-col gap-2 mt-6 w-full max-w-lg">
                {STARTERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => send(item)}
                    disabled={!status?.configured}
                    className="text-left px-4 py-2.5 border border-neutral-200 rounded text-[13px] font-semibold text-neutral-700 hover:border-black hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, turnIndex) => (
            <div key={turnIndex} className="space-y-3">
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-black text-white rounded px-4 py-2.5 max-w-[80%]">
                  <p className="text-[13px] font-semibold">{turn.question}</p>
                </div>
              </div>

              {/* Answer */}
              {turn.answer && (
                <div className="flex justify-start">
                  <div className="bg-neutral-50 border border-neutral-200 rounded px-4 py-3 max-w-[85%]">
                    <p className="text-[13px] text-neutral-800 whitespace-pre-wrap leading-relaxed">{turn.answer}</p>
                    {turn.reads > 0 && (
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2">
                        {turn.reads} data lookup{turn.reads === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {turn.error && (
                <div className="flex justify-start">
                  <div className="bg-rose-50 border border-rose-200 rounded px-4 py-3 max-w-[85%]">
                    <p className="text-[13px] text-rose-700 font-semibold">{turn.error}</p>
                  </div>
                </div>
              )}

              {/* ====== Proposals — nothing has happened yet ====== */}
              {turn.proposals?.map((proposal, proposalIndex) => (
                <div key={proposalIndex} className="flex justify-start">
                  <div className="border border-neutral-300 rounded overflow-hidden max-w-[85%] w-full">
                    <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between gap-3">
                      <span className="font-black uppercase text-[10px] tracking-wider text-neutral-500">
                        Proposed change
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">{proposal.tool}</span>
                    </div>

                    <div className="px-4 py-3 space-y-2.5">
                      <p className="text-[13px] font-bold">{proposal.summary}</p>

                      <pre className="text-[11px] bg-neutral-50 border border-neutral-150 rounded p-2.5 overflow-x-auto text-neutral-600">
{JSON.stringify(proposal.args, null, 2)}
                      </pre>

                      {proposal.status === 'proposed' ? (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => decide(turnIndex, proposalIndex, true)}
                            disabled={confirming}
                            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider cursor-pointer hover:bg-neutral-800 disabled:opacity-50"
                          >
                            <HiOutlineCheck className="w-4 h-4" /> Confirm
                          </button>
                          <button
                            onClick={() => decide(turnIndex, proposalIndex, false)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 text-neutral-700 rounded font-black uppercase text-[10px] tracking-wider cursor-pointer hover:bg-neutral-50"
                          >
                            <HiOutlineX className="w-4 h-4" /> Decline
                          </button>
                        </div>
                      ) : (
                        <p className={`font-black uppercase text-[10px] tracking-wider ${
                          proposal.status === 'confirmed' ? 'text-green-700'
                            : proposal.status === 'declined' ? 'text-neutral-500' : 'text-rose-600'
                        }`}>
                          {proposal.status}{proposal.error ? ` — ${proposal.error}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-neutral-50 border border-neutral-200 rounded px-4 py-3">
                <p className="text-[13px] text-neutral-400 font-semibold">Reading your data...</p>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ====== Composer ====== */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t border-neutral-200 p-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={status?.configured ? 'Ask about your properties...' : 'Add a Gemini API key to start'}
            disabled={!status?.configured || thinking}
            className="flex-1 bg-white border border-neutral-300 text-black font-semibold rounded px-4 py-2.5 focus:outline-none focus:border-black text-[13px] disabled:bg-neutral-50 disabled:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!status?.configured || thinking || !input.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-black text-white rounded font-black uppercase text-[10px] tracking-wider cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiOutlinePaperAirplane className="w-4 h-4" /> Ask
          </button>
        </form>
      </div>

      <p className="text-[12px] text-neutral-400 font-semibold">
        The assistant reads only your own listings and bookings. It cannot change anything on its own —
        every change is queued above for you to confirm, and validated again when you do.
      </p>
    </div>
  );
};

export default Assistant;
