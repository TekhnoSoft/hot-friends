import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  MessageCircle, 
  UserPlus, 
  Bell,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Users,
  Heart,
  Share,
  Grid3X3,
  Play,
  Bookmark,
  Gift,
  UserCheck,
  Flag,
  Home,
  Search,
  PlusSquare,
  User,
  Image,
  Video,
  Lock
} from 'lucide-react';
import Post from '../../components/Post';
import GiftModal from '../../components/GiftModal';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import { Link, useNavigate } from 'react-router-dom';

import './style.css';

const Profile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [activeMediaFilter, setActiveMediaFilter] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState('profile');

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Mock data
  const profileData = {
    id: 1,
    name: 'Ana Schultz',
    username: 'anaschultz',
    avatar: 'https://picsum.photos/120/120?random=1',
    coverImage: 'https://picsum.photos/800/300?random=2',
    bio: 'Se chegou até aqui é porque já me conhece e tem curiosidade né?! Então assina meu privacy pra ver mais conteúdo exclusivo 🔥',
    location: 'São Paulo, Brasil',
    website: 'https://anaschultz.com',
    joinDate: '2023-01-15',
    isVerified: true,
    stats: {
      followers: 509,
      following: 266,
      likes: 73100,
      posts: 692,
      media: {
        total: 775,
        photos: 456,
        videos: 219,
        paid: 100
      }
    },
    subscriptions: [
      { duration: '1 mês', price: 19.90, discount: null },
      { duration: '3 meses', price: 29.85, discount: 50 },
      { duration: '6 meses', price: 59.70, discount: 50 }
    ]
  };

  const mockPosts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    author: {
      name: profileData.name,
      username: profileData.username,
      avatar: profileData.avatar,
      isVerified: profileData.isVerified
    },
    description: i % 3 === 0 ? 'Novo conteúdo exclusivo para vocês! 💕' : 
                 i % 2 === 0 ? 'Obrigada pelo carinho de sempre! ❤️' : 
                 'Mais um dia incrível! Quem mais está animado? 🌟',
    type: i % 4 === 0 ? 'video' : 'image',
    isPaid: Math.random() > 0.7,
    mediaUrl: i % 4 === 0 ? 
      'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4' :
      `https://picsum.photos/400/500?random=${i + 10}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    likesCount: Math.floor(Math.random() * 1000) + 50,
    commentsCount: Math.floor(Math.random() * 50) + 5,
    isLiked: Math.random() > 0.5,
    isSaved: Math.random() > 0.7,
    comments: []
  }));

  const handleGoBack = () => {
    navigate(-1);
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications);
  };

  const handleGiftClick = () => {
    setShowGiftModal(true);
  };

  const handleMenuToggle = (event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId ? null : 'profile-menu');
  };

  const handleMenuAction = (action, event) => {
    event.stopPropagation();
    console.log(`Action: ${action} for profile:`, profileData.username);
    setOpenMenuId(null);
    
    switch(action) {
      case 'share':
        navigator.clipboard.writeText(`${window.location.origin}/profile/${profileData.username}`);
        console.log('Link do perfil copiado!');
        break;
      case 'addFriend':
        console.log('Adicionar como amigo');
        break;
      case 'report':
        console.log('Denunciar perfil');
        break;
      default:
        break;
    }
  };

  const handleBottomTabClick = (tab) => {
    setActiveBottomTab(tab);
    console.log('Navigate to:', tab);
  };

  const handleMediaFilterChange = (filter) => {
    setActiveMediaFilter(filter);
  };

  const getFilteredMedia = () => {
    let filtered = mockPosts.filter(post => post.type === 'image' || post.type === 'video');
    
    switch(activeMediaFilter) {
      case 'photos':
        return filtered.filter(post => post.type === 'image');
      case 'videos':
        return filtered.filter(post => post.type === 'video');
      case 'paid':
        return filtered.filter(post => post.isPaid);
      default:
        return filtered;
    }
  };

  const getFilterCount = (filter) => {
    switch(filter) {
      case 'all':
        return profileData.stats.media.total;
      case 'photos':
        return profileData.stats.media.photos;
      case 'videos':
        return profileData.stats.media.videos;
      case 'paid':
        return profileData.stats.media.paid;
      default:
        return 0;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Posicionar dropdown
  useEffect(() => {
    if (openMenuId && menuRef.current && triggerRef.current) {
      const menu = menuRef.current;
      const trigger = triggerRef.current;
      
      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 160;
      
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
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !triggerRef.current?.contains(event.target)) {
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

  return (
    <>
      <div className="profilepage-container">
        {/* Header */}
        <div className="profilepage-header">
          <button className="profilepage-back-btn" onClick={handleGoBack}>
            <ArrowLeft size={24} />
          </button>
          <div className="profilepage-header-info">
            <h1 className="profilepage-header-name">{profileData.name}</h1>
          </div>
          <button 
            ref={triggerRef}
            className="profilepage-menu-btn"
            onClick={handleMenuToggle}
            aria-label="Opções do perfil"
          >
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Cover Image */}
        <div className="profilepage-cover">
          <img 
            src={profileData.coverImage} 
            alt="Cover" 
            className="profilepage-cover-image"
          />
        </div>

        {/* Profile Info */}
        <div className="profilepage-info">
          <div className="profilepage-avatar-section">
            <div className="profilepage-avatar-container">
              <img 
                src={profileData.avatar} 
                alt={profileData.name}
                className="profilepage-avatar"
              />
            </div>
            <div className="profilepage-actions">
              <div className="profilepage-actions-left">
                <button 
                  className={`profilepage-action-btn ${isFollowing ? 'profilepage-following' : 'profilepage-follow'}`}
                  onClick={handleFollow}
                >
                  &nbsp;&nbsp;&nbsp;<UserPlus size={20} />
                  <span className="profilepage-btn-text">
                    {isFollowing ? 'Seguindo' : 'Seguir'}
                  </span>&nbsp;&nbsp;&nbsp;
                </button>
              </div>
              <div className="profilepage-actions-right">
                <button className="profilepage-action-btn profilepage-secondary">
                  <MessageCircle size={20} />
                  <span className="profilepage-btn-text">Mensagem</span>
                </button>
                <button 
                  className="profilepage-action-btn profilepage-gift"
                  onClick={handleGiftClick}
                >
                  <Gift size={20} />
                </button>
                <button 
                  className={`profilepage-action-btn profilepage-icon-only ${showNotifications ? 'profilepage-active' : ''}`}
                  onClick={handleNotificationToggle}
                >
                  <Bell size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="profilepage-details">
            <div className="profilepage-name-section">
              <h2 className="profilepage-name">
                {profileData.name}
                {profileData.isVerified && (
                  <span className="profilepage-verification">✓</span>
                )}
              </h2>
              <span className="profilepage-username">@{profileData.username}</span>
            </div>

            <div className="profilepage-bio">
              <p>{profileData.bio}</p>
            </div>

            <div className="profilepage-meta">
              <div className="profilepage-meta-item">
                <MapPin size={16} />
                <span>{profileData.location}</span>
              </div>
              <div className="profilepage-meta-item">
                <LinkIcon size={16} />
                <a href={profileData.website}  rel="noopener noreferrer">
                  {profileData.website.replace('https://', '')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="profilepage-subscriptions">
          <h3 className="profilepage-subscriptions-title">Assinaturas</h3>
          <div className="profilepage-subscriptions-list">
            {profileData.subscriptions.map((sub, index) => (
              <div key={index} className="profilepage-subscription-card">
                <div className="profilepage-subscription-info">
                  <span className="profilepage-subscription-duration">{sub.duration}</span>
                  {sub.discount && (
                    <span className="profilepage-subscription-discount">{sub.discount}% OFF</span>
                  )}
                </div>
                <div className="profilepage-subscription-price">
                  R$ {sub.price.toFixed(2).replace('.', ',')}
                </div>
                <button className="profilepage-subscription-btn">Assinar</button>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="profilepage-tabs">
          <button 
            className={`profilepage-tab ${activeTab === 'posts' ? 'profilepage-tab-active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid3X3 size={20} />
            <span>Postagens</span>
            <span className="profilepage-tab-count">{profileData.stats.posts}</span>
          </button>
          <button 
            className={`profilepage-tab ${activeTab === 'media' ? 'profilepage-tab-active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <Play size={20} />
            <span>Mídias</span>
            <span className="profilepage-tab-count">{profileData.stats.media.total}</span>
          </button>
        </div>

        {/* Media Filters */}
        {activeTab === 'media' && (
          <div className="profilepage-media-filters">
            <button 
              className={`profilepage-filter-btn ${activeMediaFilter === 'all' ? 'profilepage-filter-active' : ''}`}
              onClick={() => handleMediaFilterChange('all')}
            >
              <Grid3X3 size={16} />
              <span>{getFilterCount('all')} Todos</span>
            </button>
            <button 
              className={`profilepage-filter-btn ${activeMediaFilter === 'photos' ? 'profilepage-filter-active' : ''}`}
              onClick={() => handleMediaFilterChange('photos')}
            >
              <Image size={16} />
              <span>{getFilterCount('photos')} Fotos</span>
            </button>
            <button 
              className={`profilepage-filter-btn ${activeMediaFilter === 'videos' ? 'profilepage-filter-active' : ''}`}
              onClick={() => handleMediaFilterChange('videos')}
            >
              <Video size={16} />
              <span>{getFilterCount('videos')} Vídeos</span>
            </button>
            <button 
              className={`profilepage-filter-btn ${activeMediaFilter === 'paid' ? 'profilepage-filter-active' : ''}`}
              onClick={() => handleMediaFilterChange('paid')}
            >
              <Lock size={16} />
              <span>{getFilterCount('paid')} Pagos</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="profilepage-content">
          {activeTab === 'posts' && (
            <div className="profilepage-posts">
              {mockPosts.map(post => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="profilepage-media-grid">
              {getFilteredMedia().map(post => (
                <div key={post.id} className="profilepage-media-item">
                  {post.type === 'video' ? (
                    <div className="profilepage-media-video">
                      <img src={`https://picsum.photos/300/300?random=${post.id + 100}`} alt="" />
                      <div className="profilepage-media-video-overlay">
                        <Play size={24} />
                      </div>
                      {post.isPaid && (
                        <div className="profilepage-media-paid-badge">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="profilepage-media-photo">
                      <img src={post.mediaUrl} alt="" className="profilepage-media-image" />
                      {post.isPaid && (
                        <div className="profilepage-media-paid-badge">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {openMenuId && (
          <div 
            ref={menuRef}
            className="profilepage-dropdown-menu"
            role="menu"
          >
            <button 
              className="profilepage-menu-item"
              onClick={(e) => handleMenuAction('share', e)}
              role="menuitem"
            >
              <Share size={16} />
              <span>Compartilhar</span>
            </button>
            <div className="profilepage-menu-divider"></div>
            <button 
              className="profilepage-menu-item profilepage-menu-item-danger"
              onClick={(e) => handleMenuAction('report', e)}
              role="menuitem"
            >
              <Flag size={16} />
              <span>Denunciar</span>
            </button>
          </div>
        )}
      </div>

      <BottomTabNavigation />

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal 
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          recipient={{
            name: profileData.name,
            avatar: profileData.avatar
          }}
        />
      )}
    </>
  );
};

export default Profile;