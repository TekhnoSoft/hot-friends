import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Gift, 
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  FolderPlus,
  EyeOff,
  Flag
} from 'lucide-react';
import GiftModal from '../GiftModal';
import './style.css';

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const videoRef = useRef(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log(isSaved ? 'Post removido dos salvos' : 'Post salvo');
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGiftClick = () => {
    setShowGiftModal(true);
  };

  const handleMenuToggle = (event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId ? null : post.id);
  };

  const handleMenuAction = (action, event) => {
    event.stopPropagation();
    console.log(`Action: ${action} for post:`, post.id);
    setOpenMenuId(null);
    
    switch(action) {
      case 'copy':
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        console.log('Link copiado!');
        break;
      case 'collection':
        console.log('Adicionar à coleção');
        break;
      case 'hide':
        console.log('Ocultar post');
        break;
      case 'report':
        console.log('Denunciar post');
        break;
      default:
        break;
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: {
          name: 'Você',
          avatar: '/default-avatar.png'
        },
        createdAt: new Date().toISOString()
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Posicionar dropdown
  useEffect(() => {
    if (openMenuId && menuRef.current && triggerRef.current) {
      const menu = menuRef.current;
      const trigger = triggerRef.current;
      
      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 200;
      
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
      <article className="post fade-in">
        {/* Post Header */}
        <header className="post-header">
          <div className="post-author">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="author-avatar"
            />
            <div className="author-info">
              <h3 className="author-name">{post.author.name}</h3>
              <span className="post-time">{formatTime(post.createdAt)}</span>
            </div>
          </div>
          
          <button 
            ref={triggerRef}
            className="btn btn-ghost btn-icon"
            onClick={handleMenuToggle}
            aria-label="Opções do post"
          >
            <MoreHorizontal size={20} />
          </button>
        </header>

        {/* Post Content */}
        <div className="post-content">
          {post.description && (
            <p className="post-description">{post.description}</p>
          )}
          
          {/* Media Content */}
          <div className="post-media">
            {post.type === 'image' && (
              <img 
                src={post.mediaUrl} 
                alt="Post content"
                className="post-image"
              />
            )}
            
            {post.type === 'video' && (
              <div className="post-video-container">
                <video 
                  ref={videoRef}
                  src={post.mediaUrl}
                  className="post-video"
                  controls={false}
                  muted
                  loop
                />
                <button 
                  className="video-play-button"
                  onClick={handlePlay}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Actions */}
        <div className="post-actions">
          <div className="action-buttons">
            <button 
              className={`action-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={isLiked ? 'Descurtir' : 'Curtir'}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
            </button>
            
            <button 
              className="action-button"
              onClick={() => setShowComments(!showComments)}
              aria-label="Comentários"
            >
              <MessageCircle size={20} />
              <span>{comments.length}</span>
            </button>
            
            <button 
              className="action-button gift-button"
              onClick={handleGiftClick}
              aria-label="Enviar mimo"
            >
              <Gift size={20} />
              <span>Mimo</span>
            </button>
          </div>
          
          <button 
            className={`btn btn-ghost btn-icon ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Remover dos salvos' : 'Salvar post'}
          >
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="post-comments">
            <div className="comments-header">
              <h4>Comentários</h4>
            </div>
            
            <form className="comment-input" onSubmit={handleAddComment}>
              <img 
                src="/default-avatar.png" 
                alt="Seu avatar"
                className="comment-avatar"
              />
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="comment-field"
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={!newComment.trim()}
              >
                Enviar
              </button>
            </form>
            
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <img 
                    src={comment.author.avatar} 
                    alt={comment.author.name}
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author.name}</span>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {openMenuId && (
          <div 
            ref={menuRef}
            className="post-dropdown-menu"
            role="menu"
          >
            <button 
              className="post-menu-item"
              onClick={(e) => handleMenuAction('copy', e)}
              role="menuitem"
            >
              <Copy size={16} />
              <span>Copiar link</span>
            </button>
            <button 
              className="post-menu-item"
              onClick={(e) => handleMenuAction('collection', e)}
              role="menuitem"
            >
              <Bookmark size={16} />
              <span>Adicionar à coleção</span>
            </button>
            <button 
              className="post-menu-item"
              onClick={(e) => handleMenuAction('hide', e)}
              role="menuitem"
            >
              <EyeOff size={16} />
              <span>Ocultar post</span>
            </button>
            <div className="post-menu-divider"></div>
            <button 
              className="post-menu-item post-menu-item-danger"
              onClick={(e) => handleMenuAction('report', e)}
              role="menuitem"
            >
              <Flag size={16} />
              <span>Denunciar post</span>
            </button>
          </div>
        )}
      </article>

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal 
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          recipient={post.author}
        />
      )}
    </>
  );
};

export default Post;