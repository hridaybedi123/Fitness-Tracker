import React, { useState, useEffect, createContext, useContext, Dispatch, SetStateAction } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalorieTracker from './pages/CalorieTracker';
import WorkoutLogger from './pages/WorkoutLogger';
import WeightTracker from './pages/WeightTracker';
import type { Page, AppContextType, AppData, CalorieEntry, WorkoutData, WeightEntry } from './types';
import { MenuIcon } from './components/IconComponents';
import { useAuth } from './hooks/useAuth';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { AppContext } from './hooks/useAppData';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, query, writeBatch, getDocs } from 'firebase/firestore';

const defaultState: AppData = {
    calorieData: [],
    workoutData: {},
    weightData: [],
    maintenanceCalories: 2000,
    stepGoal: 10000,
    weightGoal: 165,
};

export const AppProvider: React.FC<{ children: React.ReactNode, setCurrentPage: Dispatch<SetStateAction<Page>> }> = ({ children, setCurrentPage }) => {
  const { currentUser } = useAuth();

  const [calorieData, setCalorieData] = useState<CalorieEntry[]>([]);
  const [workoutData, setWorkoutData] = useState<WorkoutData>({});
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [maintenanceCalories, setMaintenanceCalories] = useState<number>(2000);
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [weightGoal, setWeightGoal] = useState<number>(165);

  useEffect(() => {
    if (!currentUser) {
      setCalorieData([]);
      setWorkoutData({});
      setWeightData([]);
      setMaintenanceCalories(2000);
      setStepGoal(10000);
      setWeightGoal(165);
      return;
    }

    // Listeners for user-specific data
    const userDocRef = doc(db, 'users', currentUser.uid);
    const settingsColRef = collection(userDocRef, 'settings');
    const settingsDocRef = doc(settingsColRef, 'userSettings');
    
    const unsubscribeSettings = onSnapshot(settingsDocRef, (doc) => {
        const settings = doc.data();
        if (settings) {
            setMaintenanceCalories(settings.maintenanceCalories || 2000);
            setStepGoal(settings.stepGoal || 10000);
            setWeightGoal(settings.weightGoal || 165);
        }
    });

    const calorieColRef = collection(userDocRef, 'calorieData');
    const unsubscribeCalories = onSnapshot(query(calorieColRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalorieEntry));
        setCalorieData(data);
    });

    const workoutDocRef = doc(userDocRef, 'workoutData', 'main');
    const unsubscribeWorkouts = onSnapshot(workoutDocRef, (doc) => {
        setWorkoutData(doc.data()?.data || {});
    });

    const weightColRef = collection(userDocRef, 'weightData');
    const unsubscribeWeight = onSnapshot(query(weightColRef), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightEntry));
        setWeightData(data);
    });

    return () => {
        unsubscribeSettings();
        unsubscribeCalories();
        unsubscribeWorkouts();
        unsubscribeWeight();
    };
  }, [currentUser]);
  
  // Save settings whenever they change
  useEffect(() => {
    if (currentUser) {
      const settingsDocRef = doc(db, 'users', currentUser.uid, 'settings', 'userSettings');
      const settings = { maintenanceCalories, stepGoal, weightGoal };
      setDoc(settingsDocRef, settings, { merge: true });
    }
  }, [maintenanceCalories, stepGoal, weightGoal, currentUser]);


  // Firestore save functions
  const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id'>) => {
    if (!currentUser) return;
    const calorieColRef = collection(db, 'users', currentUser.uid, 'calorieData');
    await addDoc(calorieColRef, entry);
  };

  const updateCalorieEntry = async (id: string, updates: Partial<CalorieEntry>) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'calorieData', id);
    await setDoc(docRef, updates, { merge: true });
  };

  const deleteCalorieEntry = async (id: string) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'calorieData', id);
    await deleteDoc(docRef);
  };
  
  const clearAllCalorieData = async () => {
    if (!currentUser) return;
    const calorieColRef = collection(db, 'users', currentUser.uid, 'calorieData');
    const snapshot = await getDocs(query(calorieColRef));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  };
  
  const importCalorieData = async (data: CalorieEntry[]) => {
      if (!currentUser) return;
      await clearAllCalorieData();
      const calorieColRef = collection(db, 'users', currentUser.uid, 'calorieData');
      const batch = writeBatch(db);
      data.forEach(entry => {
          const docRef = doc(calorieColRef); // Auto-generate ID
          const { id, ...rest } = entry; // Firestore generates ID, so we discard the old one
          batch.set(docRef, rest);
      });
      await batch.commit();
  };

  const saveWorkoutData = async (data: WorkoutData) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'workoutData', 'main');
    await setDoc(docRef, { data });
  };

  const saveWeightEntry = async (entry: Omit<WeightEntry, 'id'>) => {
    if (!currentUser) return;
    const weightColRef = collection(db, 'users', currentUser.uid, 'weightData');
    await addDoc(weightColRef, entry);
  };

  const deleteWeightEntry = async (id: string) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'weightData', id);
    await deleteDoc(docRef);
  };

  const value = {
    calorieData,
    workoutData,
    weightData,
    maintenanceCalories,
    stepGoal,
    weightGoal,
    setCurrentPage,
    setMaintenanceCalories,
    setStepGoal,
    setWeightGoal,
    addCalorieEntry,
    updateCalorieEntry,
    deleteCalorieEntry,
    clearAllCalorieData,
    importCalorieData,
    saveWorkoutData,
    saveWeightEntry,
    deleteWeightEntry
  };

  return React.createElement(AppContext.Provider, { value }, children);
};

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'calorie-tracker':
        return <CalorieTracker />;
      case 'workout-logger':
        return <WorkoutLogger />;
      case 'weight-tracker':
        return <WeightTracker />;
      default:
        return <Dashboard />;
    }
  };

  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--background-start)] to-[var(--background-end)] flex items-center justify-center">
        <p className="text-2xl font-orbitron">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return isSigningUp 
      ? <SignUp onSwitchToSignIn={() => setIsSigningUp(false)} /> 
      : <SignIn onSwitchToSignUp={() => setIsSigningUp(true)} />;
  }

  return (
    <AppProvider setCurrentPage={setCurrentPage}>
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--background-start)] to-[var(--background-end)] text-[var(--text-primary)]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 rounded-lg text-gray-400 hover:text-[var(--accent-primary)] transition-colors duration-300 glass-card"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-8 transition-all duration-300">
          {renderPage()}
        </main>
      </div>
    </AppProvider>
  );
};

export default App;