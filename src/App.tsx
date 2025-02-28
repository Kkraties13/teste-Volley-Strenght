import { useState, useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { MyWorkouts } from './components/MyWorkouts';
import { Workouts } from './components/Workouts';
import { Community } from './components/Community';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { TabType } from './types';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('myWorkouts');
  const { user, loading } = useAuth();

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // For debugging
  useEffect(() => {
    console.log("Auth state:", { user, loading });
  }, [user, loading]);

  const renderContent = () => {
    switch (activeTab) {
      case 'myWorkouts':
        return <MyWorkouts />;
      case 'workouts':
        return <Workouts />;
      case 'community':
        return <Community />;
      case 'profile':
        return user ? <Profile /> : <Login />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        {renderContent()}
      </div>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;