import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { WeightEntry } from '../types';
import Modal from '../components/Modal';
// Fix: Import date-fns functions from submodules to resolve module export errors.
import { format } from 'date-fns/format';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { getDay } from 'date-fns/getDay';
import { isToday } from 'date-fns/isToday';
import { getDaysInMonth } from 'date-fns/getDaysInMonth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; unit?: string, children?: React.ReactNode }> = ({ title, value, unit, children }) => (
    <div className="glass-card p-4 flex flex-col justify-between h-full">
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className="mt-2">
                <span className="text-3xl font-orbitron font-bold text-white">{value}</span>
                {unit && <span className="text-lg text-gray-400 ml-2">{unit}</span>}
            </div>
        </div>
        {children}
    </div>
);

const Dashboard: React.FC = () => {
    const { calorieData, workoutData, weightData, saveWeightEntry, maintenanceCalories, stepGoal, setCurrentPage } = useAppData();
    const [consistencyDate, setConsistencyDate] = useState(new Date());
    const [newWeight, setNewWeight] = useState('');
    const [newWeightDate, setNewWeightDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');

    // Today's stats
    const todayCalorieEntry = calorieData.find(entry => entry.day === todayKey);
    const todayWorkoutEntry = workoutData[todayKey];
    const latestWeightEntry = weightData.length > 0 ? weightData.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

    const calorieIntake = todayCalorieEntry?.intake ?? 0;
    const calorieTarget = todayCalorieEntry?.target ?? maintenanceCalories;
    const calorieProgress = calorieTarget > 0 ? (calorieIntake / calorieTarget) * 100 : 0;
    
    const stepsToday = todayWorkoutEntry?.steps ?? 0;
    const stepProgress = stepGoal > 0 ? (stepsToday / stepGoal) * 100 : 0;
    
    const weightChartData = weightData
        .slice()
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(entry => ({
            date: format(new Date(entry.date), 'MM/dd'),
            weight: entry.weight
        }))
        .slice(-30); // Last 30 entries

    const calorieChartData = calorieData
        .map(entry => {
            const intake = entry.intake || 0;
            const exercise = entry.exercise || 0;
            const net = intake - exercise;
            const plusMinus = (entry.target || 0) - net;
            const date = new Date(entry.day);
            const dayOfWeek = format(date, 'E');
            return { date: entry.day, dayOfWeek, plusMinus };
        })
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const gradient = (
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
          </linearGradient>
        </defs>
      );

    // Consistency Calendar Logic
    const monthStart = startOfMonth(consistencyDate);
    const monthEnd = endOfMonth(consistencyDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayIndex = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1; // 0 for Monday

    const loggedDaysCount = daysInMonth.filter(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return workoutData[dateKey] && (workoutData[dateKey].type !== '' || (workoutData[dateKey].steps ?? 0) > 0);
    }).length;
    
    const totalDaysInMonth = getDaysInMonth(consistencyDate);
    const consistencyScore = totalDaysInMonth > 0 ? Math.round((loggedDaysCount / totalDaysInMonth) * 100) : 0;

    const handleLogWeight = () => {
        const weightValue = parseFloat(newWeight);
        if (!isNaN(weightValue) && weightValue > 0) {
            const newEntry = {
                date: newWeightDate,
                weight: weightValue,
            };
            saveWeightEntry(newEntry);
            setNewWeight('');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-orbitron font-bold text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Calories Today" value={calorieIntake} unit="kcal">
                    <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-[var(--accent-primary)] h-2.5 rounded-full" style={{ width: `${Math.min(calorieProgress, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 text-gray-400">{calorieIntake} / {calorieTarget} kcal</p>
                    </div>
                </StatCard>
                <StatCard title="Steps Today" value={stepsToday} unit="steps">
                    <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-[var(--accent-secondary)] h-2.5 rounded-full" style={{ width: `${Math.min(stepProgress, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 text-gray-400">{stepsToday} / {stepGoal} steps</p>
                    </div>
                </StatCard>
                <StatCard title="Current Weight" value={latestWeightEntry?.weight ?? 'N/A'} unit="lbs">
                    <form onSubmit={(e) => { e.preventDefault(); handleLogWeight(); }} className="mt-4 space-y-2">
                        <input
                            type="date"
                            value={newWeightDate}
                            onChange={(e) => setNewWeightDate(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                        />
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                            placeholder="Log new weight..."
                        />
                        <button type="submit" className="w-full px-4 py-2 text-sm bg-[var(--accent-primary)]/80 text-white font-bold rounded-md hover:bg-[var(--accent-primary)] transition">
                            Save
                        </button>
                    </form>
                    <button
                        onClick={() => setCurrentPage('weight-tracker')}
                        className="mt-2 w-full px-4 py-2 text-sm bg-gray-700/50 text-gray-300 font-bold rounded-md hover:bg-gray-700/80 transition"
                    >
                        Manage Weight
                    </button>
                </StatCard>
                <StatCard title="Workout Today" value={todayWorkoutEntry?.type || 'Rest'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-4">
                    <h3 className="text-lg font-orbitron text-gray-200 mb-4">Weight Trend (Last 30 entries)</h3>
                    {weightData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weightChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" domain={['dataMin - 1', 'dataMax + 1']} allowDataOverflow />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--surface-1)' }} />
                                <Line type="monotone" dataKey="weight" name="Weight (lbs)" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">No weight data available.</div>
                    )}
                </div>
                <div className="glass-card p-4">
                    <h3 className="text-lg font-orbitron text-gray-200 mb-4">Calorie Deficit/Surplus</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calorieChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            {gradient}
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="dayOfWeek" stroke="#888" />
                            <YAxis stroke="#888" domain={[-3000, 3000]} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--surface-1)' }} />
                            <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                            <Bar dataKey="plusMinus" name="Deficit/Surplus">
                                {calorieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.plusMinus > 0 ? "url(#colorUv)" : "url(#colorPv)"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                         <h3 className="text-lg font-orbitron text-gray-200">Workout Consistency</h3>
                         <button onClick={() => setConsistencyDate(d => new Date(d.setMonth(d.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-full text-gray-400">&lt;</button>
                        <h4 className="text-lg font-semibold text-white w-32 text-center">{format(consistencyDate, 'MMMM yyyy')}</h4>
                        <button onClick={() => setConsistencyDate(d => new Date(d.setMonth(d.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-full text-gray-400">&gt;</button>
                    </div>
                    <div>
                        <span className="font-bold text-gray-400 text-sm uppercase">Consistency: </span>
                        <span className="text-2xl font-orbitron font-bold text-white">{consistencyScore}%</span>
                    </div>
                </div>
                 <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                    {daysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const data = workoutData[dateKey];
                        const dayHasData = data && (data.type !== '' || (data.steps ?? 0) > 0);
                        const isDayToday = isToday(day);
                        return (
                            <div key={day.toString()}
                                className={`h-28 p-2 border rounded-md flex flex-col justify-between ${
                                    isDayToday ? 'border-[var(--accent-primary)]' : 'border-transparent'
                                } ${ dayHasData ? 'bg-[var(--accent-primary)]/10' : 'bg-transparent'}`}
                            >
                                <div className="font-bold text-right text-sm">{format(day, 'd')}</div>
                                {dayHasData && (
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-[var(--accent-secondary)] truncate">{data.type}</p>
                                        <p className="text-xs text-gray-300">{data.steps ? `${data.steps} steps` : ''}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>


        </div>
    );
};

export default Dashboard;