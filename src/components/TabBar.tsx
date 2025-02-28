import { motion } from 'framer-motion';
import { FaDumbbell, FaListAlt, FaUsers, FaUser } from 'react-icons/fa';
import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'myWorkouts' as TabType, icon: FaDumbbell, label: 'Meus Treinos' },
  { id: 'workouts' as TabType, icon: FaListAlt, label: 'Treinos' },
  { id: 'community' as TabType, icon: FaUsers, label: 'Comunidade' },
  { id: 'profile' as TabType, icon: FaUser, label: 'Meu Perfil' }
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-end h-16 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              className={`flex flex-col items-center relative ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => onTabChange(tab.id)}
              animate={{
                y: isActive ? -20 : 0,
                scale: isActive ? 1.1 : 1
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-4 w-full h-1 bg-blue-600 rounded-t-full"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}