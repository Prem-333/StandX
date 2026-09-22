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
    setBusy(true); setError('');
    try {
      await request('/v1/feedback', apiKey, {
        method: 'POST',
        body: JSON.stringify({
          recommendation_id: reportId, decision, record_id: recordId,
          comment: decision === 'correct'
            ? `Suggested alternative to ${item.is_number} (${item.record_id})`
            : 'Officer reviewed this candidate',
        }),
      });
      setSaved(
        decision === 'confirm' ? 'Marked correct · feedback saved'
          : decision === 'reject' ? 'Marked not relevant · feedback saved'
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
    setBusy(true); setError(''); setAlternative(null);
    try {
      setAlternative(await request(`/v1/standards/${encodeURIComponent(number.trim())}`, apiKey));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-[var(--clr-border)] bg-[var(--clr-bg-3)] px-5 sm:px-6 py-5 rounded-b-[20px] flex flex-col gap-4">
      <span className="section-label">Officer Feedback</span>

      <div className="flex flex-wrap gap-2">
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold chip-teal border transition-all hover:shadow-sm disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => send('confirm')}
        >
          <Check size={14} /> Correct
        </button>
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold border border-[var(--clr-border)] text-[var(--clr-text-muted)] bg-[var(--clr-bg-2)] hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => send('reject')}
        >
          <X size={14} /> Not relevant
        </button>
        <button
          className="interactive-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold border border-[var(--clr-border)] text-[var(--clr-text-muted)] bg-[var(--clr-bg-2)] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40"
          disabled={busy || Boolean(saved)}
          onClick={() => setSuggest(!suggest)}
        >
          <Plus size={14} /> Suggest a different standard
        </button>
      </div>

      {saved && (
        <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wide chip-teal px-3 py-1.5 rounded-lg self-start animate-slide-up" role="status">
          <Check size={12} /> {saved}
        </p>
      )}

      {suggest && (
        <div className="mt-1 pt-4 border-t border-[var(--clr-border)] animate-slide-down">
          <form onSubmit={lookup}>
            <label className="block text-xs font-bold text-[var(--clr-text)] mb-2" htmlFor={`alternative-${item.record_id}`}>
              Alternative IS number in the knowledge base
            </label>
            <div className="flex gap-2">
              <input
                id={`alternative-${item.record_id}`}
                className="input-field flex-1 py-2 px-3 text-sm"
                value={number}
                onChange={(e) => { setNumber(e.target.value); setAlternative(null); }}
                placeholder="Enter an IS number"
                required
              />
              <button className="btn-primary interactive-btn rounded-lg px-4 py-2 text-sm font-bold" disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : 'Find'}
              </button>
            </div>
          </form>

          {alternative && (
            <div className="mt-4 p-4 card animate-scale-in">
              <p className="text-sm text-[var(--clr-text)] mb-2">
                <strong className="font-bold text-[15px] text-[var(--clr-teal)]">{alternative.record.is_number}</strong>{' '}
                · {alternative.record.title}
              </p>
              <Provenance source={alternative.record.source} />
              <button className="btn-primary interactive-btn w-full mt-4 rounded-lg px-4 py-2.5 text-sm font-bold" disabled={busy} onClick={() => send('correct', alternative.record.record_id)}>
                Save suggestion
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-[var(--clr-red)] font-medium flex items-center gap-1.5">
          <AlertTriangle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
