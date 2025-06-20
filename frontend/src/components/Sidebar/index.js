import React from 'react';
import { 
  Users, 
  Bookmark, 
  CreditCard, 
  Star, 
  Settings, 
  Shield, 
  Globe, 
  HelpCircle 
} from 'lucide-react';
import './style.css';

const Sidebar = () => {
  const menuItems = [
    { icon: Users, label: 'Meu Perfil', path: '/profile' },
    { icon: Users, label: 'Seguidores', path: '/followers' },
    { icon: Bookmark, label: 'Coleções', path: '/collections' },
    { icon: CreditCard, label: 'Meus Cartões', path: '/cards' },
    { icon: Star, label: 'Torne-se Criador', path: '/become-creator' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
    { icon: Shield, label: 'Segurança e Privacidade', path: '/security' },
    { icon: Globe, label: 'Português', path: '/language' },
    { icon: HelpCircle, label: 'Ajuda', path: '/help' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button key={index} className="sidebar-item">
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;