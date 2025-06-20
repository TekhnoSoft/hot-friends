import React, { useState } from 'react';
import { useMainContext } from '../../helpers/MainContext';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Menu, 
  X,
  Home,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import './style.css';

const Header = () => {
  const { user, logout } = useMainContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    logout(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container" style={{padding: '4px 0.5rem'}}>
        <div className="header-content">
          {/* Logo */}
          <div className="header-logo">
            <img src="../logo.png" style={{width: '50px'}}/>
          </div>

          {/* Search Bar - Sempre visível */}
          <div className="header-search">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar criadores..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="header-actions desktop-only">
            {/* Notifications */}
            <button className="btn btn-ghost btn-icon">
              <Bell size={20} />
            </button>

            {/* Messages */}
            <button className="btn btn-ghost btn-icon">
              <MessageCircle size={20} />
            </button>

            {/* Profile Menu */}
            <div className="profile-menu">
              <button 
                className="profile-trigger"
                onClick={toggleMenu}
              >
                <img 
                  src={user?.avatar || '/default-avatar.png'} 
                  alt={user?.name || 'Usuário'}
                  className="profile-avatar"
                />
                <span className="profile-name">
                  {user?.name || 'Usuário'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className="menu-overlay" onClick={toggleMenu} />
                  <div className="dropdown-menu slide-in">
                    <div className="menu-header">
                      <img 
                        src={user?.avatar || '/default-avatar.png'} 
                        alt={user?.name}
                        className="menu-avatar"
                      />
                      <div className="menu-user-info">
                        <h4>{user?.name}</h4>
                        <p>{user?.followers || 0} seguidores</p>
                      </div>
                    </div>
                    
                    <div className="menu-divider" />
                    
                    <div className="menu-items">
                      <button className="menu-item">
                        <Home size={18} />
                        <span>Início</span>
                      </button>
                      <button className="menu-item">
                        <User size={18} />
                        <span>Meu Perfil</span>
                      </button>
                      <button className="menu-item">
                        <Settings size={18} />
                        <span>Configurações</span>
                      </button>
                    </div>
                    
                    <div className="menu-divider" />
                    
                    <button className="menu-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;