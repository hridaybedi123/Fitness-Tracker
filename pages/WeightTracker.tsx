import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { WeightEntry } from '../types';
import Modal from '../components/Modal';
import { format } from 'date-fns/format';

const WeightTracker: React.FC = () => {
  const { weightData, deleteWeightEntry } = useAppData();
  const [modalState, setModalState] = useState<{ type: 'delete', data?: string } | { type: null, data?: never }>({ type: null });

  const handleDelete = (id: string) => {
    deleteWeightEntry(id);
    setModalState({ type: null });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-orbitron font-bold text-white">Weight Tracker</h1>
      <div className="glass-card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-sm text-gray-400 uppercase">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Weight (lbs)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weightData.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <tr key={entry.id} className="border-b border-white/10 last:border-b-0 hover:bg-[var(--accent-primary)]/10 transition-colors">
                  <td className="p-2">{format(new Date(entry.date), 'MM/dd/yyyy')}</td>
                  <td className="p-2 text-right">{entry.weight}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => setModalState({ type: 'delete', data: entry.id })} className="text-gray-500 hover:text-[var(--danger)] transition-colors text-xl px-2">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null })} title="Confirm Deletion">
        <p>Are you sure you want to delete this entry?</p>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => setModalState({ type: null })} className="px-4 py-2 bg-[var(--surface-2)] rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={() => handleDelete(modalState.data!)} className="px-4 py-2 bg-[var(--danger)] text-white rounded-md hover:brightness-110">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default WeightTracker;