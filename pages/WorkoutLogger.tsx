import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
// Fix: Import date-fns functions from submodules to resolve module export errors.
import { format } from 'date-fns/format';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { getDay } from 'date-fns/getDay';
import { isSameDay } from 'date-fns/isSameDay';
import { isToday } from 'date-fns/isToday';
import type { WorkoutType } from '../types';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WorkoutLogger: React.FC = () => {
    const { workoutData, saveWorkoutData, stepGoal, setStepGoal } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [workoutType, setWorkoutType] = useState<WorkoutType>('');
    const [steps, setSteps] = useState<string>('');

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOfMonth = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        const dateKey = format(day, 'yyyy-MM-dd');
        const currentData = workoutData[dateKey];
        if (currentData) {
            setWorkoutType(currentData.type);
            setSteps(currentData.steps?.toString() || '');
        } else {
            setWorkoutType('');
            setSteps('');
        }
    };
    
    const handleSave = () => {
        if (selectedDate) {
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const newSteps = steps === '' ? null : parseInt(steps, 10);

            const updatedWorkoutData = { ...workoutData };

            if (workoutType === '' && (newSteps === null || newSteps <= 0)) {
                delete updatedWorkoutData[dateKey];
            } else {
                updatedWorkoutData[dateKey] = {
                    type: workoutType,
                    steps: newSteps
                };
            }
            saveWorkoutData(updatedWorkoutData);
            setSelectedDate(null);
        }
    };

    const chartData = daysInMonth.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const entry = workoutData[dateKey];
        return {
            date: format(day, 'd'),
            steps: entry?.steps || 0,
        };
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-orbitron font-bold text-white">Workout Logger</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 glass-card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-full">&lt;</button>
                        <h2 className="text-xl font-orbitron text-gray-200">{format(currentDate, 'MMMM yyyy')}</h2>
                        <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-full">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const data = workoutData[dateKey];
                            const isTodayClass = isToday(day) ? 'border-[var(--accent-primary)]' : 'border-transparent';
                            const hasDataClass = data ? 'bg-[var(--accent-primary)]/10' : '';
                            return (
                                <div key={day.toString()} onClick={() => handleDayClick(day)}
                                    className={`h-24 p-2 border rounded-md cursor-pointer hover:bg-[var(--accent-primary)]/20 transition ${isTodayClass} ${hasDataClass}`}
                                >
                                    <div className="font-bold text-right">{format(day, 'd')}</div>
                                    <div className="text-xs text-[var(--accent-secondary)] mt-2">{data?.type}</div>
                                    <div className="text-xs text-gray-300">{data?.steps ? `${data.steps} steps` : ''}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="lg:col-span-2 glass-card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-orbitron text-gray-200">Monthly Steps</h3>
                        <div>
                            <label className="text-sm text-gray-400 mr-2">Goal:</label>
                            <input type="number" value={stepGoal} onChange={e => setStepGoal(Number(e.target.value))} className="bg-gray-900/50 w-24 border border-gray-700 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition"/>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--surface-1)' }}/>
                            <ReferenceLine y={stepGoal} stroke="var(--danger)" strokeDasharray="3 3" />
                            <Bar dataKey="steps" barSize={30} fill="var(--accent-secondary)" fillOpacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {selectedDate && (
                    <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={`Log for ${format(selectedDate, 'MMMM d, yyyy')}`}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Workout Type</label>
                                <select value={workoutType} onChange={e => setWorkoutType(e.target.value as WorkoutType)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                                >
                                    <option value="">None</option>
                                    <option value="Push">Push</option>
                                    <option value="Pull">Pull</option>
                                    <option value="Legs">Legs</option>
                                    <option value="Rest">Rest</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Steps</label>
                                <input type="number" value={steps} onChange={e => setSteps(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                                    placeholder="e.g. 10000"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button onClick={() => setSelectedDate(null)} className="px-4 py-2 bg-[var(--surface-2)] rounded-md hover:bg-gray-600">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-md hover:brightness-110">Save</button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default WorkoutLogger;