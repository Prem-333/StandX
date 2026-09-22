import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, X, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { request } from '../api';
import type { Standard } from '../types';
import { Provenance } from './shared/EvidenceList';

interface FeedbackProps {
  item: Standard;
  reportId: string;
  apiKey: string;
}

export function Feedback({ item, reportId, apiKey }: FeedbackProps) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [suggest, setSuggest] = useState(false);
  const [number, setNumber] = useState('');
  const [alternative, setAlternative] = useState<{
    record: { record_id: string; is_number: string; title: string; source: string };
  } | null>(null);

  async function send(decision: 'confirm' | 'reject' | 'correct', recordId = item.record_id) {
    setBusy(true);
    setError('');
    try {
      await request('/v1/feedback', apiKey, {
        method: 'POST',
        body: JSON.stringify({
          recommendation_id: reportId,
          decision,
          record_id: recordId,
          comment:
            decision === 'correct'
              ? `Suggested alternative to ${item.is_number} (${item.record_id})`
              : 'Officer reviewed this candidate',
        }),
      });
      setSaved(
        decision === 'confirm'
          ? 'Marked correct · feedback saved'
          : decision === 'reject'
          ? 'Marked not relevant · feedback saved'
          : 'Alternative saved · feedback saved'
      );
      setSuggest(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function lookup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setAlternative(null);
    try {
      setAlternative(
        await request(`/v1/standards/${encodeURIComponent(number.trim())}`, apiKey)
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-[var(--clr-border)] bg-[var(--clr-bg-2)]/60 p-5 sm:p-6 rounded-b-[20px] flex flex-col gap-4">
      <span className="section-label">Officer Feedback</span>

      <div className="flex flex-wrap gap-2.5">
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all border border-[var(--clr-teal)]/20 bg-[var(--clr-teal)]/8 text-[var(--clr-teal)] hover:bg-[var(--clr-teal)]/15 disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => send('confirm')}
        >
          <Check size={15} />
          Correct
        </button>
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all border border-[var(--clr-border)] text-[var(--clr-text-dim)] hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/8 disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => send('reject')}
        >
          <X size={15} />
          Not relevant
        </button>
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all border border-[var(--clr-border)] text-[var(--clr-text-dim)] hover:border-[var(--clr-indigo)]/30 hover:text-[var(--clr-indigo)] hover:bg-[var(--clr-indigo)]/8 disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => setSuggest(!suggest)}
        >
          <Plus size={15} />
          Suggest a different standard
        </button>
      </div>

      {saved && (
        <p
          className="inline-flex items-center gap-2 text-[var(--clr-teal)] text-[11px] font-bold tracking-wide uppercase chip-teal px-3 py-1.5 rounded-xl self-start animate-slide-up"
          role="status"
        >
          <Check size={13} />
          {saved}
        </p>
      )}

      {suggest && (
        <div className="mt-1 pt-4 border-t border-[var(--clr-border)] animate-slide-down">
          <form onSubmit={lookup}>
            <label
              className="block text-xs font-bold text-[var(--clr-text)] mb-2"
              htmlFor={`alternative-${item.record_id}`}
            >
              Alternative IS number in the knowledge base
            </label>
            <div className="flex gap-2">
              <input
                id={`alternative-${item.record_id}`}
                className="input-dark flex-1 py-2 px-3 text-sm"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setAlternative(null);
                }}
                placeholder="Enter an IS number"
                required
              />
              <button
                className="btn-primary interactive-btn rounded-xl px-4 py-2 text-sm font-bold"
                disabled={busy}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
              </button>
            </div>
          </form>

          {alternative && (
            <div className="mt-4 p-4 glass-card animate-scale-in">
              <p className="text-sm text-[var(--clr-text)] mb-2">
                <strong className="font-bold text-[15px] text-[var(--clr-teal)]">
                  {alternative.record.is_number}
                </strong>{' '}
                · {alternative.record.title}
              </p>
              <Provenance source={alternative.record.source} />
              <button
                className="btn-primary interactive-btn w-full mt-4 rounded-xl px-4 py-2.5 text-sm font-bold"
                disabled={busy}
                onClick={() => send('correct', alternative.record.record_id)}
              >
                Save suggestion
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-red-400 font-medium flex items-center gap-1.5">
          <AlertTriangle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
