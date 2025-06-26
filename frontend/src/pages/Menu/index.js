import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMainContext } from '../../helpers/MainContext';
import { 
  ArrowLeft,
  User, 
  Users, 
  Bookmark, 
  CreditCard, 
  Star, 
  Settings, 
  Shield, 
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import Header from '../../components/Header';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import './style.css';

const Menu = () => {
  const { user, logout } = useMainContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const menuItems = [
    {
      icon: User,
      label: 'Meu Perfil',
      path: '/myprofile',
      description: 'Visualizar e editar perfil'
    },
    {
      icon: Users,
      label: 'Seguidores',
      path: '/followers',
      description: `${user?.followers || 0} seguidores • ${user?.following || 2} seguindo`
    },
    {
      icon: Bookmark,
      label: 'Coleções',
      path: '/collections',
      description: 'Conteúdos salvos'
    },
    {
      icon: CreditCard,
      label: 'Meus Cartões',
      path: '/cards',
      description: 'Gerenciar métodos de pagamento'
    },
    {
      icon: Bell,
      label: 'Notificações',
      path: '/notifications',
      description: 'Central de notificações'
    },
    {
      icon: Star,
      label: 'Torne-se Criador',
      path: '/become-creator',
      description: 'Monetize seu conteúdo',
      isHighlight: true
    }
  ];

  const settingsItems = [
    {
      icon: Settings,
      label: 'Configurações',
      path: '/settings',
      description: 'Preferências da conta'
    },
    {
      icon: Shield,
      label: 'Segurança e Privacidade',
      path: '/security',
      description: 'Controle sua privacidade'
    },
    {
      icon: Globe,
      label: 'Idioma',
      path: '/language',
      description: 'Português (Brasil)',
      showValue: true
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      path: '/help',
      description: 'Central de ajuda e suporte'
    }
  ];

  const handleMenuItemClick = (item) => {
    navigate(item.path);
  };

  return (
    <div className="menu-page">
      <Header />
      
      <div className="menu-container">
        {/* Header da página */}
        <div className="menu-header">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="menu-title">Menu</h1>
        </div>

        {/* Perfil do usuário */}
        <div className="user-profile-card">
          <div className="profile-info">
            <img 
              src={user?.avatar || 'https://picsum.photos/64/64?random=user'} 
              alt={user?.name || 'Usuário'}
              className="profile-avatar-large"
            />
            <div className="profile-details">
              <h2 className="profile-name">{user?.name || 'MarckosPG'}</h2>
              <div className="profile-stats">
                <span className="stat">
                  <strong>{user?.followers || 0}</strong> seguidores
                </span>
                <span className="stat-divider">•</span>
                <span className="stat">
                  <strong>{user?.following || 2}</strong> seguindo
                </span>
              </div>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/profile')}
          >
            Ver Perfil
          </button>
        </div>

        {/* Menu principal */}
        <div className="menu-section">
          <h3 className="section-title">Conta</h3>
          <div className="menu-items">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  className={`menu-item ${item.isHighlight ? 'highlight' : ''}`}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="menu-item-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="menu-item-content">
                    <span className="menu-item-label">{item.label}</span>
                    {item.description && (
                      <span className="menu-item-description">{item.description}</span>
                    )}
                  </div>
                  <ChevronRight size={16} className="menu-item-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Configurações */}
        <div className="menu-section">
          <h3 className="section-title">Configurações</h3>
          <div className="menu-items">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  className="menu-item"
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="menu-item-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="menu-item-content">
                    <span className="menu-item-label">{item.label}</span>
                    {item.description && (
                      <span className="menu-item-description">{item.description}</span>
                    )}
                  </div>
                  <ChevronRight size={16} className="menu-item-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de sair */}
        <div className="menu-section">
          <div className="menu-items">
            <button className="menu-item logout-item" onClick={handleLogout}>
              <div className="menu-item-icon">
                <LogOut size={20} />
              </div>
              <div className="menu-item-content">
                <span className="menu-item-label">Sair</span>
                <span className="menu-item-description">Fazer logout da conta</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <BottomTabNavigation />
    </div>
  );
};

export default Menu;