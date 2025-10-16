
import React, { useState, useRef, ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { CalorieEntry } from '../types';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
// Fix: Import date-fns functions from submodules to resolve module export error.
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { isValid } from 'date-fns/isValid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CalorieTracker: React.FC = () => {
  const { calorieData, addCalorieEntry, updateCalorieEntry, deleteCalorieEntry, clearAllCalorieData, importCalorieData, maintenanceCalories, setMaintenanceCalories } = useAppData();
  const [modalState, setModalState] = useState<{ type: 'add' | 'delete' | 'clear' | null, data?: string }>({ type: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRow = () => {
    const newEntry: Omit<CalorieEntry, 'id'> = {
      day: format(new Date(), 'yyyy-MM-dd'),
      target: 1500,
      exercise: null,
      intake: null,
    };
    addCalorieEntry(newEntry);
    setModalState({ type: null });
  };

  const handleDeleteRow = (id: string) => {
    deleteCalorieEntry(id);
    setModalState({ type: null });
  };

  const handleClearAll = () => {
    clearAllCalorieData();
    setModalState({ type: null });
  };

  const handleUpdateRow = (id: string, field: keyof CalorieEntry, value: string | number | null) => {
    updateCalorieEntry(id, { [field]: value });
  };
  
  const handleInputChange = (id: string, field: keyof Omit<CalorieEntry, 'id' | 'day'>, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateCalorieEntry(id, { [field]: value === '' ? null : parseFloat(value) });
  };

  const handleDateChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    updateCalorieEntry(id, { day: e.target.value });
  }

  const handleExport = () => {
    const dataToExport = calorieData.map((row, index) => {
        const intake = row.intake || 0;
        const exercise = row.exercise || 0;
        const net = intake - exercise;
        const plusMinus = (row.target || 0) - net;
        const gained = net - maintenanceCalories;
        return {
            'No.': index + 1,
            Day: row.day,
            Target: row.target,
            Exercise: row.exercise,
            Intake: row.intake,
            Net: net,
            'Plus/Minus': plusMinus,
            Gained: gained
        };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CalorieData");
    XLSX.writeFile(workbook, "CalorieTrackerExport.xlsx");
  };
  
  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet) as any[];

          const importedEntries: CalorieEntry[] = json.map((row, index) => {
            let day = format(new Date(), 'yyyy-MM-dd');
            const dayValue = row.Day ?? row.day;
            if (dayValue) {
              if (dayValue instanceof Date && isValid(dayValue)) {
                day = format(dayValue, 'yyyy-MM-dd');
              } else if (typeof dayValue === 'string') {
                const formatsToTry = ['yyyy-MM-dd', 'd-MMM-yy', 'd-MMM', 'MM/dd/yyyy', 'M/d/yy'];
                for (const fmt of formatsToTry) {
                  const date = parse(dayValue, fmt, new Date());
                  if (isValid(date)) {
                    day = format(date, 'yyyy-MM-dd');
                    break;
                  }
                }
              }
            }
            return {
              id: `imported-${Date.now()}-${index}`,
              day,
              target: typeof row.Target === 'number' ? row.Target : null,
              exercise: typeof row.Exercise === 'number' ? row.Exercise : null,
              intake: typeof row.Intake === 'number' ? row.Intake : null,
            };
          });
          importCalorieData(importedEntries);
        } catch (error) { console.error("Failed to import file:", error); }
      };
      reader.readAsBinaryString(file);
      e.target.value = '';
    }
  };

  const chartData = calorieData
    .map(entry => {
        const intake = entry.intake || 0;
        const exercise = entry.exercise || 0;
        const net = intake - exercise;
        const plusMinus = (entry.target || 0) - net;
        return { date: entry.day, plusMinus };
    })
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-orbitron font-bold text-white">Calorie Tracker</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-4">
                 <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setModalState({ type: 'add' })} className="px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-md hover:brightness-110 transition">Add Entry</button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-gray-600 rounded-md hover:bg-[var(--surface-1)] transition">Import Excel/CSV</button>
                        <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls, .csv"/>
                        <button onClick={handleExport} className="px-4 py-2 bg-[var(--surface-2)] text-[var(--text-primary)] border border-gray-600 rounded-md hover:bg-[var(--surface-1)] transition">Export Excel</button>
                        <button onClick={() => setModalState({ type: 'clear' })} className="px-4 py-2 bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/50 rounded-md hover:bg-[var(--danger)]/40 transition">Clear All</button>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400 mr-2">Maintenance:</label>
                        <input type="number" value={maintenanceCalories} onChange={e => setMaintenanceCalories(Number(e.target.value))} className="bg-gray-900/50 w-28 border border-gray-700 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition"/>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="border-b border-white/10 text-sm text-gray-400 uppercase">
                        <tr>
                            <th className="p-3 text-center">No.</th>
                            {['Day', 'Target', 'Exercise', 'Intake', 'Net', 'Plus/Minus', 'Gained', 'Actions'].map(h => 
                                <th key={h} className={`p-3 ${['Target', 'Exercise', 'Intake', 'Net', 'Plus/Minus', 'Gained'].includes(h) ? 'text-right' : ''} ${h === 'Actions' && 'text-center'}`}>{h}</th>)
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {calorieData.map((row, index) => {
                            const intake = row.intake || 0;
                            const exercise = row.exercise || 0;
                            const net = intake - exercise;
                            const plusMinus = (row.target || 0) - net;
                            const gained = net - maintenanceCalories;
                            const plusMinusStyle = plusMinus === 0 ? 'text-gray-400' : plusMinus > 0 ? 'text-[var(--accent-secondary)]' : 'text-[var(--danger)]';

                            return (
                            <tr key={row.id} className="border-b border-white/10 last:border-b-0 hover:bg-[var(--accent-primary)]/10 transition-colors">
                                <td className="p-2 text-center text-gray-500">{index + 1}</td>
                                <td className="p-2"><input type="date" value={row.day} onChange={(e) => handleDateChange(row.id, e)} className="bg-transparent w-full focus:outline-none font-bold"/></td>
                                <td className="p-2"><input type="number" value={row.target ?? ''} onChange={e => handleInputChange(row.id, 'target', e)} className="bg-transparent w-24 focus:outline-none text-right"/></td>
                                <td className="p-2"><input type="number" value={row.exercise ?? ''} onChange={e => handleInputChange(row.id, 'exercise', e)} className="bg-transparent w-24 focus:outline-none text-right"/></td>
                                <td className="p-2"><input type="number" value={row.intake ?? ''} onChange={e => handleInputChange(row.id, 'intake', e)} className="bg-transparent w-24 focus:outline-none text-right"/></td>
                                <td className="p-2 text-right text-gray-300">{net}</td>
                                <td className={`p-2 font-bold text-right ${plusMinusStyle}`}>{plusMinus > 0 ? `+${plusMinus}` : plusMinus}</td>
                                <td className="p-2 text-right text-gray-400">{gained}</td>
                                <td className="p-2 text-center">
                                    <button onClick={() => setModalState({ type: 'delete', data: row.id })} className="text-gray-500 hover:text-[var(--danger)] transition-colors text-xl px-2">&times;</button>
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                    </table>
                </div>
            </div>
            <div className="lg:col-span-1 glass-card p-4">
                <h3 className="text-lg font-orbitron text-gray-200 mb-4">Plus/Minus Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#888" tickFormatter={(tick) => format(new Date(tick), 'MM/dd')} />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--surface-1)' }} />
                        <Line type="monotone" dataKey="plusMinus" name="Plus/Minus" stroke="var(--accent-secondary)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

      <Modal isOpen={modalState.type === 'add'} onClose={() => setModalState({ type: null })} title="Confirm">
        <p>Add new entry?</p>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => setModalState({ type: null })} className="px-4 py-2 bg-[var(--surface-2)] rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={handleAddRow} className="px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-md hover:brightness-110">Confirm</button>
        </div>
      </Modal>

      <Modal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null })} title="Confirm Deletion">
        <p>Are you sure you want to delete this entry?</p>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => setModalState({ type: null })} className="px-4 py-2 bg-[var(--surface-2)] rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={() => handleDeleteRow(modalState.data!)} className="px-4 py-2 bg-[var(--danger)] text-white rounded-md hover:brightness-110">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={modalState.type === 'clear'} onClose={() => setModalState({ type: null })} title="Confirm Clear All">
        <p>Are you sure you want to delete all data? This action cannot be undone.</p>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => setModalState({ type: null })} className="px-4 py-2 bg-[var(--surface-2)] rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={handleClearAll} className="px-4 py-2 bg-[var(--danger)] text-white rounded-md hover:brightness-110">Clear All</button>
        </div>
      </Modal>
    </div>
  );
};

export default CalorieTracker;