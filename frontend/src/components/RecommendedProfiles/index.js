import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Check, User, MessageCircle, Share, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import './style.css';

const RecommendedProfiles = ({ profiles = [] }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [hasMoved, setHasMoved] = useState(false); // Para distinguir entre tap e drag
  const menuRef = useRef(null);
  const triggerRefs = useRef({});
  const swiperRef = useRef(null);
  const wrapperRef = useRef(null);

  const profilesPerSlide = 5;
  const totalSlides = Math.ceil(profiles.length / profilesPerSlide);

  const handleMenuToggle = (profileId, event) => {
    event.stopPropagation();
    
    if (openMenuId === profileId) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(profileId);
    }
  };

  const handleMenuAction = (action, profile, event) => {
    event.stopPropagation();
    console.log(`Action: ${action} for profile:`, profile.name);
    setOpenMenuId(null);
    
    switch(action) {
      case 'profile':
        console.log('Navigate to profile:', profile.name);
        break;
      case 'chat':
        console.log('Open chat with:', profile.name);
        break;
      case 'share':
        console.log('Share profile:', profile.name);
        break;
      case 'report':
        console.log('Report profile:', profile.name);
        break;
      default:
        break;
    }
  };

  const handleProfileClick = (profile) => {
    if (openMenuId || hasMoved) {
      setOpenMenuId(null);
      return;
    }
    console.log('Navigate to profile:', profile.name);
  };

  const getTranslateX = () => {
    const baseTranslate = -currentSlide * 100;
    const dragTranslate = isDragging ? (dragOffset / (swiperRef.current?.offsetWidth || 1)) * 100 : 0;
    return baseTranslate + dragTranslate;
  };

  const handleSlideChange = (newSlide) => {
    if (newSlide < 0) newSlide = 0;
    if (newSlide >= totalSlides) newSlide = totalSlides - 1;
    
    setCurrentSlide(newSlide);
    setOpenMenuId(null);
  };

  const handlePrevSlide = () => {
    handleSlideChange(currentSlide - 1);
  };

  const handleNextSlide = () => {
    handleSlideChange(currentSlide + 1);
  };

  // Touch/Mouse handlers
  const handleStart = (clientX, target) => {
    // Não iniciar drag se o clique foi em um botão ou elemento interativo
    if (target.closest('button') || target.closest('.recommendedprofiles-menu-trigger')) {
      return;
    }
    
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
    setDragOffset(0);
    setHasMoved(false);
    setOpenMenuId(null);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    
    setCurrentX(clientX);
    const offset = clientX - startX;
    setDragOffset(offset);
    
    // Marcar que houve movimento se passou de um threshold mínimo
    if (Math.abs(offset) > 5) {
      setHasMoved(true);
    }
  };
    

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = (swiperRef.current?.offsetWidth || 0) * 0.2; // 20% da largura
    const offset = currentX - startX;
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0 && currentSlide > 0) {
        // Swipe right - slide anterior
        handleSlideChange(currentSlide - 1);
      } else if (offset < 0 && currentSlide < totalSlides - 1) {
        // Swipe left - próximo slide
        handleSlideChange(currentSlide + 1);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
    
    // Reset hasMoved após um pequeno delay para permitir que o click seja processado
    setTimeout(() => {
      setHasMoved(false);
    }, 100);
  };

  // Touch events - removido preventDefault()
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX, e.target);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    handleEnd();
  };

  // Mouse events (para desktop)
  const handleMouseDown = (e) => {
    // Não prevenir default se for um botão
    if (!e.target.closest('button') && !e.target.closest('.recommendedprofiles-menu-trigger')) {
      e.preventDefault();
    }
    handleStart(e.clientX, e.target);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleEnd();
  };

  const handleMouseLeave = (e) => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Posicionar dropdown dinamicamente
  useEffect(() => {
    if (openMenuId && menuRef.current && triggerRefs.current[openMenuId]) {
      const menu = menuRef.current;
      const trigger = triggerRefs.current[openMenuId];
      
      // Resetar posição inicial para calcular corretamente
      menu.style.top = '0px';
      menu.style.left = '0px';
      menu.style.visibility = 'hidden';
      
      // Aguardar próximo frame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const container = trigger.closest('.recommendedprofiles-container');
        const containerRect = container.getBoundingClientRect();

        // Posição inicial: abaixo do botão, alinhado à direita
        let top = triggerRect.bottom - containerRect.top + 8;
        let left = triggerRect.right - containerRect.left - menuRect.width;

        // Verificar se o menu ultrapassa a parte inferior da viewport
        if (triggerRect.bottom + menuRect.height + 8 > viewportHeight) {
          // Posicionar acima do botão
          top = triggerRect.top - containerRect.top - menuRect.height - 8;
        }

        // Verificar se o menu ultrapassa a lateral esquerda
        if (triggerRect.right - menuRect.width < 0) {
          // Alinhar à esquerda do botão
          left = triggerRect.left - containerRect.left;
        }

        // Verificar se o menu ultrapassa a lateral direita
        if (triggerRect.left + menuRect.width > viewportWidth) {
          left = triggerRect.right - containerRect.left - menuRect.width;
        }

        // Garantir que não saia dos limites do container
        let maxLeft = 0;
        let maxTop = 0;

        if(currentSlide != 0){
          maxLeft = containerRect.width - menuRect.width;
          left = Math.max(0, Math.min(left, maxLeft));

          maxTop = containerRect.height - menuRect.height;
          top = Math.max(0, Math.min(top, maxTop));
        }else{
          maxLeft = containerRect.width - menuRect.width;
          left = Math.max(0, Math.min(left, maxLeft));

          maxTop = containerRect.height - menuRect.height;
          top = Math.max(0, Math.min(top, maxTop + 200));
        }

        if(currentSlide == 0){
          if(openMenuId == profilesPerSlide){
            top = top + 310;
            left = left - 25;
          }else{
            top = top - 130;
            left = left - 25;
          }
        }

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.visibility = 'visible';
      });
    }
  }, [openMenuId]);

  // Fechar menu ao clicar fora ou ao fazer scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !triggerRefs.current[openMenuId]?.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleScroll = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openMenuId]);

  // Mouse events globais para drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = (e) => handleMouseUp(e);
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  // Suporte a navegação por teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isDragging) return;
      
      if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isDragging]);

  if (!profiles || profiles.length === 0) {
    return (
      <div className="recommendedprofiles-container">
        <div className="recommendedprofiles-header">
          <h3 className="recommendedprofiles-title">Perfis Recomendados</h3>
        </div>
        <div className="recommendedprofiles-empty">
          <p>Nenhum perfil recomendado disponível no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendedprofiles-container">
      <div className="recommendedprofiles-header">
        <h3 className="recommendedprofiles-title">Perfis Recomendados</h3>
        <div className="recommendedprofiles-navigation">
          <button 
            className="recommendedprofiles-nav-btn recommendedprofiles-nav-prev"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0 || isDragging}
            aria-label="Perfis anteriores"
          >
            <ChevronLeft size={18} />
          </button>
          {/*<span className="recommendedprofiles-slide-counter">
            {currentSlide + 1} / {totalSlides}
          </span>*/}
          <button 
            className="recommendedprofiles-nav-btn recommendedprofiles-nav-next"
            onClick={handleNextSlide}
            disabled={currentSlide === totalSlides - 1 || isDragging}
            aria-label="Próximos perfis"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div 
        className={`recommendedprofiles-swiper ${isDragging ? 'recommendedprofiles-swiper-dragging' : ''}`}
        ref={swiperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: 'pan-y pinch-zoom' }} // Permite scroll vertical mas controla horizontal
      >
        <div 
          ref={wrapperRef}
          className="recommendedprofiles-swiper-wrapper"
          style={{
            transform: `translateX(${getTranslateX()}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {Array.from({ length: totalSlides }, (_, slideIndex) => (
            <div key={slideIndex} className="recommendedprofiles-slide">
              <div className="recommendedprofiles-grid">
                {profiles
                  .slice(slideIndex * profilesPerSlide, (slideIndex + 1) * profilesPerSlide)
                  .map((profile, index) => (
                    <div 
                      key={profile.id} 
                      className="recommendedprofiles-card"
                      onClick={() => handleProfileClick(profile)}
                      style={{
                        pointerEvents: isDragging ? 'none' : 'auto'
                      }}
                    >
                      <div className="recommendedprofiles-banner">
                        <img 
                          src={profile.coverImage || profile.avatar} 
                          alt=""
                          className="recommendedprofiles-banner-image"
                          loading="lazy"
                          draggable={false}
                        />
                        
                        <div className="recommendedprofiles-banner-overlay"></div>
                        
                        <div className="recommendedprofiles-avatar-container">
                          <img 
                            src={profile.avatar} 
                            alt={profile.name}
                            className="recommendedprofiles-avatar"
                            loading="lazy"
                            draggable={false}
                          />
                        </div>
                        
                        <div className="recommendedprofiles-text">
                          <div className="recommendedprofiles-name-container">
                            <h4 className="recommendedprofiles-name">{profile.name}</h4>
                            {profile.isVerified && (
                              <div className="recommendedprofiles-verification-badge">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                          <p className="recommendedprofiles-username">@{profile.username}</p>
                        </div>
                        
                        <div className="recommendedprofiles-menu">
                          <button 
                            ref={el => triggerRefs.current[profile.id] = el}
                            className={`recommendedprofiles-menu-trigger recommendedprofiles-menu-trigger-${index}`}
                            onClick={(e) => handleMenuToggle(profile.id, e)}
                            onTouchStart={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            disabled={isDragging}
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swipe hint para mobile */}
      <div className="recommendedprofiles-swipe-hint">
        <span>← Deslize para navegar →</span>
      </div>

      {openMenuId && (
        <div 
          ref={menuRef}
          className="recommendedprofiles-dropdown-menu"
          style={{
            position: 'absolute',
            visibility: 'hidden', // Inicialmente oculto até ser posicionado
            zIndex: 1000,
          }}
        >
          <button 
            className="recommendedprofiles-menu-item"
            onClick={(e) => handleMenuAction('profile', profiles.find(p => p.id === openMenuId), e)}
          >
            <User size={16} />
            <span>Perfil</span>
          </button>
          <button 
            className="recommendedprofiles-menu-item"
            onClick={(e) => handleMenuAction('chat', profiles.find(p => p.id === openMenuId), e)}
          >
            <MessageCircle size={16} />
            <span>Chat</span>
          </button>
          <button 
            className="recommendedprofiles-menu-item"
            onClick={(e) => handleMenuAction('share', profiles.find(p => p.id === openMenuId), e)}
          >
            <Share size={16} />
            <span>Compartilhar</span>
          </button>
          <button 
            className="recommendedprofiles-menu-item recommendedprofiles-menu-item-danger"
            onClick={(e) => handleMenuAction('report', profiles.find(p => p.id === openMenuId), e)}
          >
            <Flag size={16} />
            <span>Denunciar perfil</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedProfiles;