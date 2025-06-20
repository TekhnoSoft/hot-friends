import React, { useState, useRef, useEffect } from 'react';
import { 
  Search,
  Filter,
  MoreVertical,
  MessageCircle,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  UserMinus,
  Flag,
  Home,
  PlusSquare,
  User
} from 'lucide-react';
import './style.css';

import Inbox from '../Inbox';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import Header from '../../components/Header';

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODAS');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);

  const menuRef = useRef(null);
  const triggerRefs = useRef({});

  // Mock data dos chats
  const mockChats = [
    {
      id: 1,
      user: {
        name: 'Kine',
        username: 'Kinezinha',
        avatar: 'https://picsum.photos/60/60?random=1',
        isOnline: true,
        isFree: true
      },
      lastMessage: {
        text: 'Minha bucetinha tá pulsando, com uma...',
        timestamp: '00:00',
        isRead: false,
        isFromMe: false
      },
      unreadCount: 3
    },
    {
      id: 2,
      user: {
        name: 'Ruivinha22',
        username: 'NaraDias',
        avatar: 'https://picsum.photos/60/60?random=2',
        isOnline: false,
        isFree: false
      },
      lastMessage: {
        text: 'Obrigada 😏',
        timestamp: 'Ontem',
        isRead: true,
        isFromMe: false
      },
      unreadCount: 0
    },
    {
      id: 3,
      user: {
        name: 'Carol Santos',
        username: 'CarolS',
        avatar: 'https://picsum.photos/60/60?random=3',
        isOnline: true,
        isFree: false
      },
      lastMessage: {
        text: 'Você: Oi, tudo bem?',
        timestamp: '15:30',
        isRead: true,
        isFromMe: true
      },
      unreadCount: 0
    },
    {
      id: 4,
      user: {
        name: 'Ana Beatriz',
        username: 'AnaBia',
        avatar: 'https://picsum.photos/60/60?random=4',
        isOnline: false,
        isFree: true
      },
      lastMessage: {
        text: 'Vou enviar mais fotos hoje à noite',
        timestamp: '14:22',
        isRead: false,
        isFromMe: false
      },
      unreadCount: 1
    },
    {
      id: 5,
      user: {
        name: 'Melissa',
        username: 'MelissaX',
        avatar: 'https://picsum.photos/60/60?random=5',
        isOnline: true,
        isFree: false
      },
      lastMessage: {
        text: 'Adorei nosso papo de ontem ❤️',
        timestamp: '12:45',
        isRead: true,
        isFromMe: false
      },
      unreadCount: 0
    },
    {
      id: 6,
      user: {
        name: 'Júlia Lima',
        username: 'JuLima',
        avatar: 'https://picsum.photos/60/60?random=6',
        isOnline: false,
        isFree: true
      },
      lastMessage: {
        text: 'Você: Quando vai postar conteúdo novo?',
        timestamp: '11:20',
        isRead: false,
        isFromMe: true
      },
      unreadCount: 2
    }
  ];

  const filters = ['TODAS', 'NÃO VISUALIZADAS', 'INTERAÇÕES'];

  const handleMenuToggle = (chatId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleMenuAction = (action, chat, event) => {
    event.stopPropagation();
    console.log(`Action: ${action} for chat with:`, chat.user.name);
    setOpenMenuId(null);
    
    switch(action) {
      case 'call':
        console.log('Iniciar chamada de voz');
        break;
      case 'video':
        console.log('Iniciar chamada de vídeo');
        break;
      case 'info':
        console.log('Ver informações do usuário');
        break;
      case 'archive':
        console.log('Arquivar conversa');
        break;
      case 'delete':
        console.log('Excluir conversa');
        break;
      case 'unfollow':
        console.log('Deixar de seguir');
        break;
      case 'report':
        console.log('Denunciar usuário');
        break;
      default:
        break;
    }
  };

  // Atualize a função handleChatClick:
  const handleChatClick = (chat) => {
    if (openMenuId) {
      setOpenMenuId(null);
      return;
    }
    setSelectedChat(chat);
  };

  const handleBottomTabClick = (tab) => {
    setActiveBottomTab(tab);
    console.log('Navigate to:', tab);
  };

  const getFilteredChats = () => {
    let filtered = mockChats;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    switch(activeFilter) {
      case 'NÃO VISUALIZADAS':
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case 'INTERAÇÕES':
        filtered = filtered.filter(chat => chat.lastMessage.isFromMe);
        break;
      default:
        break;
    }

    // Filtro por usuários online
    if (showOnlineOnly) {
      filtered = filtered.filter(chat => chat.user.isOnline);
    }

    return filtered;
  };

  const getTotalUnreadCount = () => {
    return getFilteredChats().reduce((total, chat) => total + chat.unreadCount, 0);
  };

  // Posicionar dropdown
  useEffect(() => {
    if (openMenuId && menuRef.current && triggerRefs.current[openMenuId]) {
      const menu = menuRef.current;
      const trigger = triggerRefs.current[openMenuId];
      
      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 280;
      
      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - menuWidth;

      if (top + menuHeight > window.innerHeight) {
        top = triggerRect.top - menuHeight - 8;
      }
      if (left < 8) {
        left = triggerRect.left;
      }
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      menu.style.position = 'fixed';
      menu.style.top = `${Math.max(8, top)}px`;
      menu.style.left = `${Math.max(8, left)}px`;
      menu.style.zIndex = '99999';
    }
  }, [openMenuId]);

  // Fechar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !triggerRefs.current[openMenuId]?.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleScroll = () => {
      if (openMenuId) setOpenMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openMenuId]);

  if (selectedChat) {
    return (
      <Inbox 
        chat={selectedChat} 
        onBack={() => setSelectedChat(null)} 
      />
    );
  }

  return (
    <>
      <div className="chatspage-container">
        {/* Header */}
        <Header />

        {/* Search Bar */}
        <div className="chatspage-search">
          <div className="chatspage-search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Pesquisar em minhas conversas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="chatspage-filters">
          <div className="chatspage-filters-header">
            <span className="chatspage-filters-title">As mais recentes primeiro</span>
            <button className="chatspage-filter-toggle">
              <Filter size={16} />
            </button>
          </div>
          
          <div className="chatspage-filter-tabs">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`chatspage-filter-tab ${activeFilter === filter ? 'chatspage-filter-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="chatspage-online-toggle">
            <label className="chatspage-toggle-label">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="chatspage-toggle-input"
              />
              <span className="chatspage-toggle-slider"></span>
              <span className="chatspage-toggle-text">Exibir apenas usuários online</span>
            </label>
          </div>
        </div>

        {/* Chat List */}
        <div className="chatspage-list">
          {getFilteredChats().length === 0 ? (
            <div className="chatspage-empty">
              <MessageCircle size={48} />
              <h3>Nenhuma conversa encontrada</h3>
              <p>Tente ajustar os filtros ou iniciar uma nova conversa.</p>
            </div>
          ) : (
            getFilteredChats().map((chat) => (
              <div
                key={chat.id}
                className="chatspage-item"
                onClick={() => handleChatClick(chat)}
              >
                <div className="chatspage-avatar-container">
                  <img
                    src={chat.user.avatar}
                    alt={chat.user.name}
                    className="chatspage-avatar"
                  />
                  {chat.user.isOnline && (
                    <div className="chatspage-online-indicator"></div>
                  )}
                  {chat.user.isFree && (
                    <div className="chatspage-free-badge">Grátis</div>
                  )}
                </div>

                <div className="chatspage-content">
                  <div className="chatspage-user-info">
                    <h4 className="chatspage-name">{chat.user.name}</h4>
                    <span className="chatspage-username">(@{chat.user.username})</span>
                  </div>
                  <p className="chatspage-message">
                    {chat.lastMessage.text}
                  </p>
                </div>

                <div className="chatspage-meta">
                  <span className="chatspage-time">{chat.lastMessage.timestamp}</span>
                  {chat.unreadCount > 0 && (
                    <div className="chatspage-unread-badge">{chat.unreadCount}</div>
                  )}
                  <button
                    ref={el => triggerRefs.current[chat.id] = el}
                    className="chatspage-menu-trigger"
                    onClick={(e) => handleMenuToggle(chat.id, e)}
                    aria-label={`Menu para ${chat.user.name}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dropdown Menu */}
        {openMenuId && (
          <div 
            ref={menuRef}
            className="chatspage-dropdown-menu"
            role="menu"
          >
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('call', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Phone size={16} />
              <span>Chamada de voz</span>
            </button>
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('video', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Video size={16} />
              <span>Chamada de vídeo</span>
            </button>
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('info', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Info size={16} />
              <span>Informações</span>
            </button>
            <div className="chatspage-menu-divider"></div>
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('archive', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Archive size={16} />
              <span>Arquivar</span>
            </button>
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('delete', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Trash2 size={16} />
              <span>Excluir conversa</span>
            </button>
            <button 
              className="chatspage-menu-item"
              onClick={(e) => handleMenuAction('unfollow', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <UserMinus size={16} />
              <span>Deixar de seguir</span>
            </button>
            <button 
              className="chatspage-menu-item chatspage-menu-item-danger"
              onClick={(e) => handleMenuAction('report', mockChats.find(c => c.id === openMenuId), e)}
              role="menuitem"
            >
              <Flag size={16} />
              <span>Denunciar</span>
            </button>
          </div>
        )}
      </div>

      <BottomTabNavigation/>
    </>
  );
};

export default Messages;