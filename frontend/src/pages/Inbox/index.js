import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Mic,
  Gift,
  Image as ImageIcon,
  Play,
  Pause,
  Download,
  Heart,
  Reply,
  Copy,
  Trash2,
  Flag,
  Info,
  Archive,
  UserMinus
} from 'lucide-react';
import GiftModal from '../../components/GiftModal';
import './style.css';

const Inbox = ({ chat, onBack }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const messageRefs = useRef({});

  // Mock data das mensagens
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'text',
      content: 'Oi! Como você está?',
      timestamp: '14:30',
      isFromMe: false,
      isRead: true,
      reactions: []
    },
    {
      id: 2,
      type: 'text',
      content: 'Oi! Estou bem, obrigado! E você?',
      timestamp: '14:32',
      isFromMe: true,
      isRead: true,
      reactions: []
    },
    {
      id: 3,
      type: 'image',
      content: 'https://picsum.photos/300/400?random=1',
      caption: 'Olha essa foto que tirei hoje!',
      timestamp: '14:35',
      isFromMe: false,
      isRead: true,
      reactions: [{ emoji: '❤️', count: 1 }]
    },
    {
      id: 4,
      type: 'audio',
      content: 'audio_url_here',
      duration: '0:15',
      timestamp: '14:40',
      isFromMe: true,
      isRead: true,
      reactions: []
    },
    {
      id: 5,
      type: 'gift',
      content: {
        amount: 50,
        message: 'Obrigado pelas fotos lindas! ❤️'
      },
      timestamp: '14:45',
      isFromMe: true,
      isRead: true,
      reactions: []
    },
    {
      id: 6,
      type: 'text',
      content: 'Muito obrigada pelo mimo! Você é um amor! 😘',
      timestamp: '14:47',
      isFromMe: false,
      isRead: false,
      reactions: []
    }
  ]);

  // Mock user data
  const currentUser = {
    name: 'Você',
    avatar: 'https://picsum.photos/40/40?random=999'
  };

  const otherUser = chat?.user || {
    name: 'Kine',
    username: 'Kinezinha',
    avatar: 'https://picsum.photos/40/40?random=1',
    isOnline: true
  };

  // Emojis populares
  const popularEmojis = ['❤️', '😘', '🔥', '😍', '🥰', '😊', '👏', '🎉', '💕', '😂', '🤤', '💦'];

  // GIFs populares (mock)
  const popularGifs = [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif'
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'text',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromMe: true,
      isRead: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simular digitação do outro usuário
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simular resposta automática
        const autoReply = {
          id: Date.now() + 1,
          type: 'text',
          content: 'Obrigada pela mensagem! 😊',
          timestamp: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isFromMe: false,
          isRead: false,
          reactions: []
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
    }, 1000);
  };

  const handleSendEmoji = (emoji) => {
    const newMessage = {
      id: Date.now(),
      type: 'text',
      content: emoji,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromMe: true,
      isRead: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setShowEmojis(false);
  };

  const handleSendGif = (gifUrl) => {
    const newMessage = {
      id: Date.now(),
      type: 'gif',
      content: gifUrl,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromMe: true,
      isRead: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setShowGifs(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'file';

    const newMessage = {
      id: Date.now(),
      type: fileType,
      content: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromMe: true,
      isRead: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleRecordAudio = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simular gravação de áudio
      setTimeout(() => {
        setIsRecording(false);
        const newMessage = {
          id: Date.now(),
          type: 'audio',
          content: 'audio_recorded',
          duration: '0:05',
          timestamp: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isFromMe: true,
          isRead: false,
          reactions: []
        };
        setMessages(prev => [...prev, newMessage]);
      }, 3000);
    }
  };

  const handleGiftSend = () => {
    setShowGiftModal(true);
  };

  const handleGiftConfirm = (giftData) => {
    const newMessage = {
      id: Date.now(),
      type: 'gift',
      content: giftData,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromMe: true,
      isRead: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setShowGiftModal(false);
  };

  const handleMessageLongPress = (messageId, event) => {
    setSelectedMessage(messageId);
    setOpenMenuId(messageId);
  };

  const handleMenuAction = (action, messageId) => {
    console.log(`Action: ${action} for message:`, messageId);
    setOpenMenuId(null);
    setSelectedMessage(null);
    
    switch(action) {
      case 'reply':
        console.log('Reply to message');
        break;
      case 'copy':
        const msg = messages.find(m => m.id === messageId);
        if (msg && msg.type === 'text') {
          navigator.clipboard.writeText(msg.content);
        }
        break;
      case 'delete':
        setMessages(prev => prev.filter(m => m.id !== messageId));
        break;
      case 'report':
        console.log('Report message');
        break;
      default:
        break;
    }
  };

  const handleReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1 }]
          };
        }
      }
      return msg;
    }));
  };

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Posicionar dropdown
  useEffect(() => {
    if (openMenuId && menuRef.current && messageRefs.current[openMenuId]) {
      const menu = menuRef.current;
      const trigger = messageRefs.current[openMenuId];
      
      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 200;
      
      let top = triggerRect.top - menuHeight - 8;
      let left = triggerRect.left;

      if (top < 8) {
        top = triggerRect.bottom + 8;
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

  // Fechar menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
        setSelectedMessage(null);
      }
      if (showEmojis && !event.target.closest('.inbox-emoji-picker')) {
        setShowEmojis(false);
      }
      if (showGifs && !event.target.closest('.inbox-gif-picker')) {
        setShowGifs(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId, showEmojis, showGifs]);

  const renderMessage = (msg) => {
    const isMe = msg.isFromMe;
    
    return (
      <div
        key={msg.id}
        ref={el => messageRefs.current[msg.id] = el}
        className={`inbox-message ${isMe ? 'inbox-message-me' : 'inbox-message-other'}`}
        onContextMenu={(e) => {
          e.preventDefault();
          handleMessageLongPress(msg.id, e);
        }}
        onClick={() => {
          if (selectedMessage === msg.id) {
            setSelectedMessage(null);
            setOpenMenuId(null);
          }
        }}
      >
        {!isMe && (
          <img 
            src={otherUser.avatar} 
            alt={otherUser.name}
            className="inbox-message-avatar"
          />
        )}
        
        <div className="inbox-message-content">
          {msg.type === 'text' && (
            <div className="inbox-message-bubble inbox-text-message">
              <p>{msg.content}</p>
            </div>
          )}
          
          {msg.type === 'image' && (
            <div className="inbox-message-bubble inbox-media-message">
              <img src={msg.content} alt="Shared image" className="inbox-shared-image" />
              {msg.caption && <p className="inbox-media-caption">{msg.caption}</p>}
            </div>
          )}
          
          {msg.type === 'gif' && (
            <div className="inbox-message-bubble inbox-media-message">
              <img src={msg.content} alt="GIF" className="inbox-shared-gif" />
            </div>
          )}
          
          {msg.type === 'audio' && (
            <div className="inbox-message-bubble inbox-audio-message">
              <button className="inbox-audio-play">
                <Play size={16} />
              </button>
              <div className="inbox-audio-waveform">
                <div className="inbox-audio-progress"></div>
              </div>
              <span className="inbox-audio-duration">{msg.duration}</span>
            </div>
          )}
          
          {msg.type === 'gift' && (
            <div className="inbox-message-bubble inbox-gift-message">
              <div className="inbox-gift-icon">
                <Gift size={24} />
              </div>
              <div className="inbox-gift-content">
                <h4>Mimo Enviado</h4>
                <p className="inbox-gift-amount">R$ {msg.content.amount?.toFixed(2).replace('.', ',')}</p>
                {msg.content.message && (
                  <p className="inbox-gift-text">"{msg.content.message}"</p>
                )}
              </div>
            </div>
          )}
          
          <div className="inbox-message-meta">
            <span className="inbox-message-time">{msg.timestamp}</span>
            {isMe && (
              <span className={`inbox-message-status ${msg.isRead ? 'inbox-read' : 'inbox-sent'}`}>
                ✓{msg.isRead && '✓'}
              </span>
            )}
          </div>
          
          {msg.reactions.length > 0 && (
            <div className="inbox-message-reactions">
              {msg.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="inbox-reaction-badge"
                  onClick={() => handleReaction(msg.id, reaction.emoji)}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isMe && (
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="inbox-message-avatar"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="inbox-container">
        {/* Header */}
        <div className="inbox-header">
          <button className="inbox-back-btn" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          
          <div className="inbox-user-info">
            <img 
              src={otherUser.avatar} 
              alt={otherUser.name}
              className="inbox-header-avatar"
            />
            <div className="inbox-user-details">
              <h3 className="inbox-user-name">{otherUser.name}</h3>
              <span className="inbox-user-status">
                {otherUser.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="inbox-header-actions">
            <button className="inbox-header-btn">
              <Phone size={20} />
            </button>
            <button className="inbox-header-btn">
              <Video size={20} />
            </button>
            <button 
              ref={triggerRef}
              className="inbox-header-btn"
              onClick={() => setOpenMenuId(openMenuId ? null : 'header-menu')}
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="inbox-messages">
          {messages.map(renderMessage)}
          
          {isTyping && (
            <div className="inbox-typing-indicator">
              <img 
                src={otherUser.avatar} 
                alt={otherUser.name}
                className="inbox-message-avatar"
              />
              <div className="inbox-typing-bubble">
                <div className="inbox-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="inbox-input-area">
          {/* Emoji Picker */}
          {showEmojis && (
            <div className="inbox-emoji-picker">
              <div className="inbox-emoji-grid">
                {popularEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="inbox-emoji-btn"
                    onClick={() => handleSendEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* GIF Picker */}
          {showGifs && (
            <div className="inbox-gif-picker">
              <div className="inbox-gif-grid">
                {popularGifs.map((gif, index) => (
                  <button
                    key={index}
                    className="inbox-gif-btn"
                    onClick={() => handleSendGif(gif)}
                  >
                    <img src={gif} alt={`GIF ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="inbox-input-container">
            <div className="inbox-input-actions">
              <button 
                className="inbox-input-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={20} />
              </button>
              <button 
                className={`inbox-input-btn ${showEmojis ? 'inbox-active' : ''}`}
                onClick={() => {
                  setShowEmojis(!showEmojis);
                  setShowGifs(false);
                }}
              >
                <Smile size={20} />
              </button>
              <button 
                className="inbox-input-btn"
                onClick={() => {
                  setShowGifs(!showGifs);
                  setShowEmojis(false);
                }}
              >
                GIF
              </button>
              <button 
                className="inbox-input-btn inbox-gift-btn"
                onClick={handleGiftSend}
              >
                <Gift size={20} />
              </button>
            </div>
            
            <div className="inbox-message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite uma mensagem..."
                className="inbox-text-input"
              />
              
              {message.trim() ? (
                <button 
                  className="inbox-send-btn"
                  onClick={handleSendMessage}
                >
                  <Send size={20} />
                </button>
              ) : (
                <button 
                  className={`inbox-record-btn ${isRecording ? 'inbox-recording' : ''}`}
                  onClick={handleRecordAudio}
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Message Context Menu */}
        {openMenuId && openMenuId !== 'header-menu' && (
          <div 
            ref={menuRef}
            className="inbox-context-menu"
            role="menu"
          >
            <button 
              className="inbox-menu-item"
              onClick={() => handleMenuAction('reply', selectedMessage)}
            >
              <Reply size={16} />
              <span>Responder</span>
            </button>
            <button 
              className="inbox-menu-item"
              onClick={() => handleMenuAction('copy', selectedMessage)}
            >
              <Copy size={16} />
              <span>Copiar</span>
            </button>
            <button 
              className="inbox-menu-item"
              onClick={() => handleReaction(selectedMessage, '❤️')}
            >
              <Heart size={16} />
              <span>Reagir</span>
            </button>
            <div className="inbox-menu-divider"></div>
            <button 
              className="inbox-menu-item inbox-menu-danger"
              onClick={() => handleMenuAction('delete', selectedMessage)}
            >
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>
            <button 
              className="inbox-menu-item inbox-menu-danger"
              onClick={() => handleMenuAction('report', selectedMessage)}
            >
              <Flag size={16} />
              <span>Denunciar</span>
            </button>
          </div>
        )}

        {/* Header Menu */}
        {openMenuId === 'header-menu' && (
          <div 
            ref={menuRef}
            className="inbox-header-menu"
            role="menu"
          >
            <button className="inbox-menu-item">
              <Info size={16} />
              <span>Informações</span>
            </button>
            <button className="inbox-menu-item">
              <Archive size={16} />
              <span>Arquivar</span>
            </button>
            <div className="inbox-menu-divider"></div>
            <button className="inbox-menu-item">
              <UserMinus size={16} />
              <span>Deixar de seguir</span>
            </button>
            <button className="inbox-menu-item inbox-menu-danger">
              <Flag size={16} />
              <span>Denunciar</span>
            </button>
          </div>
        )}
      </div>

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal 
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          onConfirm={handleGiftConfirm}
          recipient={otherUser}
        />
      )}
    </>
  );
};

export default Inbox;