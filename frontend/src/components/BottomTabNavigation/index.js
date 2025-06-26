import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  Menu 
} from 'lucide-react';
import './style.css';
import CreatePostModal from '../CreatePostModal';

const BottomTabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const tabs = [
    {
      id: 'home',
      icon: Home,
      label: 'Início',
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Buscar',
      path: '/search',
      isActive: location.pathname === '/search'
    },
    {
      id: 'post',
      icon: Plus,
      label: 'Post',
      path: '/create-post',
      isActive: location.pathname === '/create-post',
      isSpecial: true
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'Chat',
      path: '/messages',
      isActive: location.pathname === '/messages',
      hasNotification: true
    },
    {
      id: 'menu',
      icon: Menu,
      label: 'Menu',
      path: '/menu',
      isActive: location.pathname === '/menu'
    }
  ];

  const handleTabClick = (tab) => {
    if (tab.id === 'post') {
      setIsCreatePostModalOpen(true);
    } else {  
      navigate(tab.path);
    }
  };

  return (
    <>  
      <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
      />
      <nav className="bottom-tab-navigation">
        <div className="tab-container">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-item ${tab.isActive ? 'active' : ''} ${tab.isSpecial ? 'special' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                <div className="tab-icon-container">
                  <IconComponent 
                    size={tab.isSpecial ? 28 : 24} 
                    className="tab-icon"
                    fill={tab.isActive && !tab.isSpecial ? 'currentColor' : 'none'}
                    strokeWidth={tab.isSpecial ? 2.5 : 2}
                  />
                  {tab.hasNotification && (
                    <div className="notification-dot" />
                  )}
                </div>
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomTabNavigation;