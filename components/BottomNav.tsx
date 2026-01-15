
import React from 'react';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'home', icon: 'fa-house', label: 'Inicio' },
    { id: 'capture', icon: 'fa-plus', label: 'Capturar' },
    { id: 'planner', icon: 'fa-calendar', label: 'Planificador' },
    { id: 'shopping', icon: 'fa-cart-shopping', label: 'Lista' },
    { id: 'profile', icon: 'fa-user', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentTab === tab.id ? 'text-orange-500' : 'text-slate-400'
          }`}
        >
          <i className={`fa-solid ${tab.icon} text-lg mb-1`}></i>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
