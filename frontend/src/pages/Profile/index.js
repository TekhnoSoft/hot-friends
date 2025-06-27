import React, { useState, useRef, useEffect, useContext } from 'react';
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
  Lock,
  X
} from 'lucide-react';
import Post from '../../components/Post';
import GiftModal from '../../components/GiftModal';
import PaymentModal from '../../components/PaymentModal';
import Modal from '../../components/Modal';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Api from '../../Api';

import './style.css';
import Environment from '../../Environment';
import { MainContext } from '../../helpers/MainContext';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  const { user } = useContext(MainContext);

  const [activeTab, setActiveTab] = useState('posts');
  const [activeMediaFilter, setActiveMediaFilter] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (username) {
      if (username === user.username) {
        navigate('/myprofile');
      }
      loadProfileData();
    } else {
      setError('Username não fornecido');
      setLoading(false);
    }
  }, [username]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Api.getProfile(username);
      if (response.data.success) {
        setProfileData(response.data.data);
      } else {
        setError(response.data.message || 'Erro ao carregar perfil');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
    console.log(`Action: ${action} for profile:`, profileData?.username);
    setOpenMenuId(null);
    
    switch(action) {
      case 'share':
        navigator.clipboard.writeText(`${window.location.origin}/profile?username=${profileData?.username}`);
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

  const handleMediaClick = (media) => {
    if (media.is_paid) {
      setSelectedMedia(media);
      setShowPaymentModal(true);
    } else {
      setSelectedMedia(media);
      setShowMediaModal(true);
    }
  };

  const getFilteredMedia = () => {
    if (!profileData?.posts) return [];
    
    let filtered = profileData.posts.filter(post => post.media_type === 'image' || post.media_type === 'video');
    
    switch(activeMediaFilter) {
      case 'photos':
        return filtered.filter(post => post.media_type === 'image');
      case 'videos':
        return filtered.filter(post => post.media_type === 'video');
      case 'paid':
        return filtered.filter(post => post.is_paid);
      default:
        return filtered;
    }
  };

  const getFilterCount = (filter) => {
    if (!profileData?.posts) return 0;
    
    const posts = profileData.posts;
    switch(filter) {
      case 'all':
        return posts.filter(post => post.media_type === 'image' || post.media_type === 'video').length;
      case 'photos':
        return posts.filter(post => post.media_type === 'image').length;
      case 'videos':
        return posts.filter(post => post.media_type === 'video').length;
      case 'paid':
        return posts.filter(post => post.is_paid).length;
      default:
        return 0;
    }
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

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profilepage-error">
        <h2>Erro ao carregar perfil</h2>
        <p>{error}</p>
        <button onClick={handleGoBack} className="profilepage-back-btn">
          <ArrowLeft size={24} />
          Voltar
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profilepage-not-found">
        <h2>Perfil não encontrado</h2>
        <p>O perfil que você está procurando não existe ou foi removido.</p>
        <button onClick={handleGoBack} className="profilepage-back-btn">
          <ArrowLeft size={24} />
          Voltar
        </button>
      </div>
    );
  }

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
            src={profileData.coverImage || 'https://picsum.photos/800/300?random=2'} 
            alt="Cover" 
            className="profilepage-cover-image"
          />
        </div>

        {/* Profile Info */}
        <div className="profilepage-info">
          <div className="profilepage-avatar-section">
            <div className="profilepage-avatar-container">
              <img 
                src={profileData.avatar || 'https://picsum.photos/120/120?random=1'} 
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
            {profileData.location && (
              <div className="profilepage-meta-item">
                <MapPin size={16} />
                <span>{profileData.location}</span>
              </div>
            )}
            {profileData.website && (
              <div className="profilepage-meta-item">
                <LinkIcon size={16} />
                <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                  {profileData.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>


         {/* Subscriptions */}
         <div className="profilepage-subscriptions">
          <h3 className="profilepage-subscriptions-title">Assinaturas</h3>
          <div className="profilepage-subscriptions-list">
            
              <div className="profilepage-subscription-card">
                <div className="profilepage-subscription-info">
                  <span className="profilepage-subscription-duration">3 meses</span>
                  <span className="profilepage-subscription-discount">10% OFF</span>
                </div>
                <div className="profilepage-subscription-price">
                  R$ 10,00
                </div>
                <button className="profilepage-subscription-btn">Assinar</button>
              </div>
          
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
            <span className="profilepage-tab-count">{profileData.posts_count}</span>
          </button>
          <button 
            className={`profilepage-tab ${activeTab === 'media' ? 'profilepage-tab-active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <Play size={20} />
            <span>Mídias</span>
            <span className="profilepage-tab-count">{getFilterCount('all')}</span>
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
              {profileData.posts?.map(post => (
                <Post key={post.id} post={post} />
              ))}
              {profileData.posts?.length === 0 && (
                <div className="profilepage-empty-state">
                  <Grid3X3 size={48} />
                  <h3>Nenhuma postagem</h3>
                  <p>Este usuário ainda não fez nenhuma postagem.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="profilepage-media-grid">
              {getFilteredMedia().map(post => (
                <div 
                  key={post.id} 
                  className="profilepage-media-item"
                  onClick={() => handleMediaClick(post)}
                >
                  {post.media_type === 'video' ? (
                    <div className="profilepage-media-video">
                      <video src={`${Environment.API_BASE}/posts/media/${	post.media_url}`} alt="" />
                      <div className="profilepage-media-video-overlay">
                        <Play size={24} />
                      </div>
                      {post.is_paid && (
                        <div className="profilepage-media-paid-badge">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="profilepage-media-photo">
                      <img src={`${Environment.API_BASE}/posts/media/${post.media_url}`} alt="" className="profilepage-media-image" />
                      {post.is_paid && (
                        <div className="profilepage-media-paid-badge">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {getFilteredMedia().length === 0 && (
                <div className="profilepage-media-empty">
                  <Grid3X3 size={48} />
                  <h3>Nenhuma mídia encontrada</h3>
                  <p>Não há mídias disponíveis para os filtros selecionados.</p>
                </div>
              )}
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

      {/* Modals */}
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

      {showPaymentModal && selectedMedia && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMedia(null);
          }}
          post={selectedMedia}
        />
      )}

      {showMediaModal && selectedMedia && (
        <Modal
          isOpen={showMediaModal}
          title={selectedMedia.media_type === 'video' ? 'Vídeo' : 'Foto'}
          onClose={() => {
            setShowMediaModal(false);
            setSelectedMedia(null);
          }}
        >
          <div className="profilepage-media-modal">
            {selectedMedia.media_type === 'video' ? (
              <video 
                src={`${Environment.API_BASE}/posts/media/${selectedMedia.media_url}`} 
                controls 
                style={{width: '100%'}}
                className="profilepage-media-modal-content"
              />
            ) : (
              <img 
                style={{width: '100%'}}
                src={`${Environment.API_BASE}/posts/media/${selectedMedia.media_url}`} 
                alt="" 
                className="profilepage-media-modal-content"
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Profile;