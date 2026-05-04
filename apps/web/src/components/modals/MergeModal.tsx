'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '../../services/apiClient';
import { Person } from '../../types/graph';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { ValidationMessage } from '../ui/ValidationMessage';

type MovingRelationship = {
  type: string;
  direction: 'OUTGOING' | 'INCOMING';
  relatedPersonId: string;
  relatedName: string;
  relationshipGroupId?: string;
};

type DryRunResult = {
  source: { personId: string; name: string };
  target: { personId: string; name: string };
  movingRelationships: MovingRelationship[];
  impact: { relationshipCount: number };
};

type MergeModalProps = {
  duplicateRisks: Person[];
  people: Person[];
  onClose: () => void;
  onMergeComplete: () => void;
};

type MergePhase = 'select' | 'preview' | 'done';

export function MergeModal({ duplicateRisks, people, onClose, onMergeComplete }: MergeModalProps) {
  const [phase, setPhase] = useState<MergePhase>('select');
  const [selectedSource, setSelectedSource] = useState<Person | null>(duplicateRisks[0] ?? null);
  const [selectedTarget, setSelectedTarget] = useState<Person | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-suggest a target when a source is selected
  useEffect(() => {
    if (!selectedSource) return;
    const autoTarget = people.find(
      (p) => p.phone === selectedSource.phone && p.id !== selectedSource.id,
    );
    setSelectedTarget(autoTarget ?? null);
  }, [selectedSource, people]);

  async function handlePreview() {
    if (!selectedSource || !selectedTarget) {
      setMessage('Select both a source and a target person to preview the merge.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const result = await apiClient.post<DryRunResult>('/api/merge/dry-run', {
        sourcePersonId: selectedSource.id,
        targetPersonId: selectedTarget.id,
      });
      setDryRunResult(result);
      setPhase('preview');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load merge preview.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExecute() {
    if (!selectedSource || !selectedTarget) return;
    setIsLoading(true);
    setMessage('');
    try {
      await apiClient.post('/api/merge/execute', {
        sourcePersonId: selectedSource.id,
        targetPersonId: selectedTarget.id,
      });
      setPhase('done');
      onMergeComplete();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not execute merge.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal title="Merge Review Queue" onClose={onClose}>
      {phase === 'select' && (
        <div className="space-y-4 mt-4">
          <p className="text-sm text-[#667085]">
            Select the duplicate (source) to merge into a target profile. The source will be marked as Merged
            and its connections will move to the target.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wide">
              Duplicate to remove (source)
            </label>
            {duplicateRisks.length === 0 ? (
              <p className="text-sm text-[#667085]">No duplicate risks found.</p>
            ) : (
              duplicateRisks.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                    selectedSource?.id === person.id
                      ? 'border-[#ff5a00] bg-[#fff4ec]'
                      : 'border-[#eee7df] hover:bg-[#fbfaf7]'
                  }`}
                  onClick={() => setSelectedSource(person)}
                >
                  <Avatar person={person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{person.name}</p>
                    <p className="text-xs text-[#667085]">{person.phone}</p>
                  </div>
                  <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-xs font-semibold text-[#f05200]">
                    {person.status}
                  </span>
                </button>
              ))
            )}
          </div>

          {selectedSource && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wide">
                Keep (target)
              </label>
              <select
                className="control w-full"
                value={selectedTarget?.id ?? ''}
                onChange={(e) => setSelectedTarget(people.find((p) => p.id === e.target.value) ?? null)}
              >
                <option value="">Select target person…</option>
                {people
                  .filter((p) => p.id !== selectedSource.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.phone}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <ValidationMessage message={message} />

          <button
            className="primary-button h-11 w-full justify-center"
            type="button"
            disabled={!selectedSource || !selectedTarget || isLoading}
            onClick={handlePreview}
          >
            {isLoading ? 'Loading preview…' : 'Preview Merge →'}
          </button>
        </div>
      )}

      {phase === 'preview' && dryRunResult && (
        <div className="space-y-4 mt-4">
          <div className="rounded-lg border border-[#eee7df] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#667085]">Remove (source)</p>
                <p className="font-semibold truncate">{dryRunResult.source.name}</p>
              </div>
              <Icon name="merge" className="text-[#ff5a00] shrink-0" />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs text-[#667085]">Keep (target)</p>
                <p className="font-semibold truncate">{dryRunResult.target.name}</p>
              </div>
            </div>
            <div className="rounded-md bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534]">
              <strong>{dryRunResult.impact.relationshipCount}</strong> connection
              {dryRunResult.impact.relationshipCount !== 1 ? 's' : ''} will move to{' '}
              <strong>{dryRunResult.target.name}</strong>.
            </div>
          </div>

          {dryRunResult.movingRelationships.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#475467] uppercase tracking-wide mb-2">
                Connections being moved
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {dryRunResult.movingRelationships.map((rel, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md bg-[#fbfaf7] px-3 py-2 text-sm"
                  >
                    <span className="text-[#667085]">{rel.direction === 'OUTGOING' ? '→' : '←'}</span>
                    <span className="font-medium">{rel.type.replace(/_/g, ' ')}</span>
                    <span className="text-[#667085]">with</span>
                    <span>{rel.relatedName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ValidationMessage message={message} />

          <div className="flex gap-3">
            <button
              className="secondary-button h-11 flex-1 justify-center"
              type="button"
              onClick={() => setPhase('select')}
            >
              ← Back
            </button>
            <button
              className="primary-button h-11 flex-1 justify-center bg-[#dc2626] hover:bg-[#b91c1c]"
              type="button"
              disabled={isLoading}
              onClick={handleExecute}
            >
              {isLoading ? 'Merging…' : 'Confirm Merge'}
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-4 space-y-4 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f0fdf4] mx-auto">
            <Icon name="merge" className="text-[#16a34a] h-8 w-8" />
          </div>
          <p className="font-semibold">Merge complete!</p>
          <p className="text-sm text-[#667085]">
            The source profile has been marked as Merged and all connections have been transferred.
          </p>
          <button className="primary-button h-11 w-full justify-center" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
