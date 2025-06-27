import React, { useState, useEffect } from 'react';
import { useMainContext } from '../../helpers/MainContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Grid3X3,
  Play,
  Image,
  Video,
  Lock,
  Edit3,
  Camera
} from 'lucide-react';
import Modal from '../../components/Modal';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import './style.css';
import Api from '../../Api';

const MyProfile = () => {
  const { user, refreshUserData } = useMainContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [activeMediaFilter, setActiveMediaFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    coverImage: ''
  });

  // Atualiza o formData quando o usuário é carregado ou alterado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || ''
      });
    }
  }, [user]);

  // Mock data temporário
  const mockPosts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    type: i % 4 === 0 ? 'video' : 'image',
    isPaid: Math.random() > 0.7,
    mediaUrl: i % 4 === 0 ? 
      'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4' :
      `https://picsum.photos/400/500?random=${i + 10}`,
  }));

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEditProfile = () => {
    // Reseta o formData com os dados atuais do usuário antes de abrir o modal
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
        coverImage: user.coverImage || ''
      });
    }
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaFilterChange = (filter) => {
    setActiveMediaFilter(filter);
  };

  const getFilteredMedia = () => {
    let filtered = mockPosts;
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

  const handleSaveProfile = async () => {
    try {
      const response = await Api.updateProfile(formData);
      if (response.success) {
        setShowEditModal(false);
        refreshUserData();
      } else {
        // TODO: Mostrar mensagem de erro
        console.error('Erro ao atualizar perfil:', response.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          coverImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Se não houver usuário, mostra loading ou redireciona
  if (!user) {
    return null; // ou um componente de loading
  }

  return (
    <div className="myprofile-container">
      {/* Header */}
      <div className="myprofile-header">
        <button className="myprofile-back-btn" onClick={handleGoBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="myprofile-header-info">
          <h1 className="myprofile-header-name">Meu Perfil</h1>
        </div>
        <button 
          className="myprofile-settings-btn"
          onClick={handleEditProfile}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Cover Image */}
      <div className="myprofile-cover">
        <img 
          src={Api.getImageUrlProfile(user.coverImage, 'cover') || 'https://picsum.photos/800/300?random=cover'} 
          alt="Cover" 
          className="myprofile-cover-image"
        />
      </div>

      {/* Profile Info */}
      <div className="myprofile-info">
        <div className="myprofile-avatar-section">
          <div className="myprofile-avatar-container">
            <img 
              src={Api.getImageUrlProfile(user.avatar, 'avatar') || 'https://picsum.photos/120/120?random=avatar'} 
              alt={user.name}
              className="myprofile-avatar"
            />
          </div>
        </div>

        <div className="myprofile-details">
          <div className="myprofile-name-section">
            <h2 className="myprofile-name">
              {user.name}
            </h2>
            <span className="myprofile-username">@{user.username}</span>
          </div>

          <div className="myprofile-bio">
            <p>{user.bio || "Adicione uma bio ao seu perfil..."}</p>
          </div>

          <div className="myprofile-meta">
            {user.location && (
              <div className="myprofile-meta-item">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="myprofile-meta-item">
                <LinkIcon size={16} />
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="myprofile-tabs">
        <button 
          className={`myprofile-tab ${activeTab === 'posts' ? 'myprofile-tab-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <Grid3X3 size={20} />
          <span>Postagens</span>
        </button>
        <button 
          className={`myprofile-tab ${activeTab === 'media' ? 'myprofile-tab-active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <Play size={20} />
          <span>Mídias</span>
        </button>
      </div>

      {/* Media Filters */}
      {activeTab === 'media' && (
        <div className="myprofile-media-filters">
          <button 
            className={`myprofile-filter-btn ${activeMediaFilter === 'all' ? 'myprofile-filter-active' : ''}`}
            onClick={() => handleMediaFilterChange('all')}
          >
            <Grid3X3 size={16} />
            <span>Todos</span>
          </button>
          <button 
            className={`myprofile-filter-btn ${activeMediaFilter === 'photos' ? 'myprofile-filter-active' : ''}`}
            onClick={() => handleMediaFilterChange('photos')}
          >
            <Image size={16} />
            <span>Fotos</span>
          </button>
          <button 
            className={`myprofile-filter-btn ${activeMediaFilter === 'videos' ? 'myprofile-filter-active' : ''}`}
            onClick={() => handleMediaFilterChange('videos')}
          >
            <Video size={16} />
            <span>Vídeos</span>
          </button>
          <button 
            className={`myprofile-filter-btn ${activeMediaFilter === 'paid' ? 'myprofile-filter-active' : ''}`}
            onClick={() => handleMediaFilterChange('paid')}
          >
            <Lock size={16} />
            <span>Pagos</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="myprofile-content">
        {activeTab === 'media' && (
          <div className="myprofile-media-grid">
            {getFilteredMedia().map(post => (
              <div key={post.id} className="myprofile-media-item">
                {post.type === 'video' ? (
                  <div className="myprofile-media-video">
                    <img src={`https://picsum.photos/300/300?random=${post.id + 100}`} alt="" />
                    <div className="myprofile-media-video-overlay">
                      <Play size={24} />
                    </div>
                    {post.isPaid && (
                      <div className="myprofile-media-paid-badge">
                        <Lock size={16} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="myprofile-media-photo">
                    <img src={post.mediaUrl} alt="" className="myprofile-media-image" />
                    {post.isPaid && (
                      <div className="myprofile-media-paid-badge">
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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Perfil"
        maxWidth="500px"
      >
        <div className="myprofile-modal-content">
          {/* Avatar e Capa */}
          <div className="myprofile-media-upload">
            <div className="myprofile-cover-upload">
              <img 
                src={formData.coverImage && formData.coverImage.startsWith('data:') 
                  ? formData.coverImage 
                  : Api.getImageUrlProfile(formData.coverImage, 'cover') || 'https://picsum.photos/800/300?random=cover'} 
                alt="Cover" 
              />
              <label htmlFor="cover-upload" className="myprofile-upload-btn">
                <Camera size={20} />
                <span>Alterar capa</span>
              </label>
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="myprofile-avatar-upload">
              <img 
                src={formData.avatar && formData.avatar.startsWith('data:') 
                  ? formData.avatar 
                  : Api.getImageUrlProfile(formData.avatar, 'avatar') || 'https://picsum.photos/120/120?random=avatar'} 
                alt={formData.name}
              />
              <label htmlFor="avatar-upload" className="myprofile-upload-btn">
                <Camera size={20} />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Formulário */}
          <div className="myprofile-form">
            <div className="myprofile-form-group">
              <label>Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Seu nome"
              />
            </div>

            <div className="myprofile-form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                placeholder="@username"
              />
            </div>

            <div className="myprofile-form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleFormChange}
                placeholder="Sua biografia"
                rows={3}
              />
            </div>

            <div className="myprofile-form-group">
              <label>Localização</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                placeholder="Sua localização"
              />
            </div>

            <div className="myprofile-form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleFormChange}
                placeholder="Seu website"
              />
            </div>
          </div>

          <div className="myprofile-modal-footer">
            <button 
              className="myprofile-modal-cancel"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="myprofile-modal-save"
              onClick={handleSaveProfile}
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      <BottomTabNavigation />
    </div>
  );
};

export default MyProfile; 