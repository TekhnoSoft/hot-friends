import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  ArrowRight,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Chrome,
  TrendingUp
} from 'lucide-react';
import Post from '../../components/Post';
import './style.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock data das últimas postagens
  const latestPosts = [
    {
      id: 1,
      author: {
        name: 'Ana Schultz',
        username: 'anaschultz',
        avatar: 'https://picsum.photos/40/40?random=1',
        isVerified: true
      },
      description: 'Bom dia meus amores! ☀️ Começando o dia com muito carinho para vocês. Quem mais está animado para hoje? 💕',
      type: 'image',
      mediaUrl: 'https://picsum.photos/400/500?random=1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      likesCount: 1247,
      commentsCount: 89,
      isLiked: false,
      isSaved: false,
      comments: []
    },
    {
      id: 2,
      author: {
        name: 'Melissa Santos',
        username: 'melissax',
        avatar: 'https://picsum.photos/40/40?random=2',
        isVerified: true
      },
      description: 'Treino de hoje finalizado! 💪 Quem mais está cuidando da saúde? Vamos juntas nessa jornada! 🏃‍♀️✨',
      type: 'video',
      mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
      likesCount: 892,
      commentsCount: 156,
      isLiked: false,
      isSaved: false,
      comments: []
    },
    {
      id: 3,
      author: {
        name: 'Carol Lima',
        username: 'carols',
        avatar: 'https://picsum.photos/40/40?random=3',
        isVerified: false
      },
      description: 'Sessão de fotos de hoje! 📸 O que acharam do resultado? Comentem aqui embaixo! 💖',
      type: 'image',
      mediaUrl: 'https://picsum.photos/400/600?random=3',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
      likesCount: 634,
      commentsCount: 72,
      isLiked: false,
      isSaved: false,
      comments: []
    },
    {
      id: 4,
      author: {
        name: 'Júlia Mendes',
        username: 'juliamendes',
        avatar: 'https://picsum.photos/40/40?random=4',
        isVerified: true
      },
      description: 'Noite perfeita para relaxar! 🌙 Acabei de postar conteúdo exclusivo para meus assinantes. Quem já viu? 😘',
      type: 'image',
      mediaUrl: 'https://picsum.photos/400/500?random=4',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
      likesCount: 1456,
      commentsCount: 203,
      isLiked: false,
      isSaved: false,
      comments: []
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação de email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação de senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validações específicas para cadastro
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório';
      }

      if (!formData.username) {
        newErrors.username = 'Username é obrigatório';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username deve ter pelo menos 3 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Você deve aceitar os termos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isLogin) {
        console.log('Login realizado:', { 
          email: formData.email, 
          password: formData.password 
        });
        // Redirecionar para dashboard
      } else {
        console.log('Cadastro realizado:', formData);
        // Redirecionar para verificação de email ou dashboard
      }
    } catch (error) {
      console.error('Erro:', error);
      setErrors({ general: 'Erro interno. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      username: '',
      acceptTerms: false
    });
    setErrors({});
  };

  const handleGoogleLogin = () => {
    console.log('Login com Google');
    // Implementar login com Google
  };

  const handleForgotPassword = () => {
    console.log('Recuperar senha');
    // Implementar recuperação de senha
  };

  return (
    <div className="loginpage-container">
      {/* Desktop Layout */}
      <div className="loginpage-desktop-layout">
        {/* Left Side - Branding */}
        <div className="loginpage-branding">
          <div className="loginpage-branding-content">
            <div className="loginpage-logo">
              <img src="/logo.png" alt="Hot Friends" className="loginpage-logo-image" />
              <h1>Hot Friends</h1>
            </div>
            <div className="loginpage-tagline">
              <h2>Conecte-se com pessoas incríveis</h2>
              <p>Descubra uma nova forma de fazer amizades e compartilhar momentos especiais com pessoas que pensam como você.</p>
            </div>
            <div className="loginpage-features">
              <div className="loginpage-feature">
                <div className="loginpage-feature-icon">🔥</div>
                <div className="loginpage-feature-text">
                  <h3>Conteúdo Exclusivo</h3>
                  <p>Acesse conteúdos únicos dos seus criadores favoritos</p>
                </div>
              </div>
              <div className="loginpage-feature">
                <div className="loginpage-feature-icon">💬</div>
                <div className="loginpage-feature-text">
                  <h3>Chat Privado</h3>
                  <p>Converse diretamente com seus amigos de forma segura</p>
                </div>
              </div>
              <div className="loginpage-feature">
                <div className="loginpage-feature-icon">🎁</div>
                <div className="loginpage-feature-text">
                  <h3>Mimos Especiais</h3>
                  <p>Demonstre seu carinho enviando presentes virtuais</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="loginpage-form-side">
          <div className="loginpage-form-container">
            {/* Mobile Logo */}
            <div className="loginpage-mobile-logo">
              <img src="/logo.png" alt="Hot Friends" className="loginpage-logo-image" />
              <h1>Hot Friends</h1>
            </div>

            <div className="loginpage-form-header">
              <h2>{isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}</h2>
              <p>
                {isLogin 
                  ? 'Bem-vindo de volta! Entre com seus dados.' 
                  : 'Junte-se à nossa comunidade exclusiva.'
                }
              </p>
            </div>

            {/* Google Login */}
            <div className="loginpage-social-login">
              <button 
                className="loginpage-google-btn"
                onClick={handleGoogleLogin}
                type="button"
              >
                <Chrome size={20} />
                <span>Continuar com Google</span>
              </button>
            </div>

            <div className="loginpage-divider">
              <span>ou</span>
            </div>

            {/* Form */}
            <form className="loginpage-form" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="loginpage-error-general">
                  {errors.general}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Nome completo</label>
                    <div className="loginpage-input-container">
                      <User size={20} className="loginpage-input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        className={`loginpage-input ${errors.name ? 'loginpage-input-error' : ''}`}
                      />
                    </div>
                    {errors.name && (
                      <span className="loginpage-error">{errors.name}</span>
                    )}
                  </div>

                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Nome de usuário</label>
                    <div className="loginpage-input-container">
                      <span className="loginpage-username-prefix">@</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="seuusername"
                        className={`loginpage-input loginpage-username-input ${errors.username ? 'loginpage-input-error' : ''}`}
                      />
                    </div>
                    {errors.username && (
                      <span className="loginpage-error">{errors.username}</span>
                    )}
                  </div>
                </>
              )}

              <div className="loginpage-input-group">
                <label className="loginpage-label">Email</label>
                <div className="loginpage-input-container">
                  <Mail size={20} className="loginpage-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className={`loginpage-input ${errors.email ? 'loginpage-input-error' : ''}`}
                  />
                </div>
                {errors.email && (
                  <span className="loginpage-error">{errors.email}</span>
                )}
              </div>

              <div className="loginpage-input-group">
                <label className="loginpage-label">Senha</label>
                <div className="loginpage-input-container">
                  <Lock size={20} className="loginpage-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Sua senha"
                    className={`loginpage-input ${errors.password ? 'loginpage-input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="loginpage-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="loginpage-error">{errors.password}</span>
                )}
              </div>

              {!isLogin && (
                <div className="loginpage-input-group">
                  <label className="loginpage-label">Confirmar senha</label>
                  <div className="loginpage-input-container">
                    <Lock size={20} className="loginpage-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirme sua senha"
                      className={`loginpage-input ${errors.confirmPassword ? 'loginpage-input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="loginpage-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="loginpage-error">{errors.confirmPassword}</span>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="loginpage-forgot-password">
                  <button 
                    type="button" 
                    className="loginpage-forgot-link"
                    onClick={handleForgotPassword}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="loginpage-checkbox-group">
                  <label className="loginpage-checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="loginpage-checkbox"
                    />
                    <span className="loginpage-checkbox-custom"></span>
                    <span className="loginpage-checkbox-text">
                      Eu aceito os{' '}
                      <a href="/terms" className="loginpage-link">Termos de Uso</a>
                      {' '}e{' '}
                      <a href="/privacy" className="loginpage-link">Política de Privacidade</a>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <span className="loginpage-error">{errors.acceptTerms}</span>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="loginpage-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loginpage-loading">
                    <div className="loginpage-spinner"></div>
                    <span>{isLogin ? 'Entrando...' : 'Criando conta...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="loginpage-switch-mode">
              <p>
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button 
                  type="button" 
                  className="loginpage-switch-btn"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Criar conta' : 'Entrar'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Posts Section */}
      <div className="loginpage-latest-posts">
        <div className="loginpage-posts-container">
          <div className="loginpage-posts-header">
            <div className="loginpage-posts-title">
              <TrendingUp size={24} />
              <h3>Últimas Postagens</h3>
            </div>
            <p>Veja o que está acontecendo na nossa comunidade</p>
          </div>
          
          <div className="loginpage-posts-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="loginpage-post-wrapper">
                <Post post={post} />
              </div>
            ))}
          </div>
          
          <div className="loginpage-posts-cta">
            <h4>Quer ver mais conteúdo exclusivo?</h4>
            <p>Faça login ou crie sua conta para acessar todo o conteúdo da nossa comunidade</p>
            <button 
              className="loginpage-cta-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="loginpage-footer">
        <div className="loginpage-footer-content">
          {/* Copyright */}
          <div className="loginpage-footer-copyright">
            <p>©2025 Hot Friends</p>
          </div>

          {/* Social Links */}
          <div className="loginpage-footer-social">
            <a href="https://instagram.com"  rel="noopener noreferrer" className="loginpage-social-link">
              <Instagram size={20} />
            </a>
            <a href="https://youtube.com"  rel="noopener noreferrer" className="loginpage-social-link">
              <Youtube size={20} />
            </a>
            <a href="https://twitter.com"  rel="noopener noreferrer" className="loginpage-social-link">
              <Twitter size={20} />
            </a>
          </div>

          {/* Language Selector */}
          <div className="loginpage-footer-language">
            <button className="loginpage-language-btn">
              <Globe size={16} />
              <span>Português</span>
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="loginpage-footer-links">
          <div className="loginpage-footer-section">
            <h4>Sobre</h4>
            <ul>
              <li><a href="/about">Sobre nós</a></li>
              <li><a href="/press">Imprensa</a></li>
              <li><a href="/help">Ajuda & FAQ</a></li>
              <li><a href="/brand">Uso da Marca</a></li>
              <li><a href="/how-it-works">Como Funciona</a></li>
              <li><a href="/safety">Centro de Segurança e Transparência</a></li>
            </ul>
          </div>

          <div className="loginpage-footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/contact">Contato</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/privacy">Privacidade</a></li>
              <li><a href="/terms">Termos e Políticas</a></li>
              <li><a href="/ads">Hot Friends Ads (Em breve)</a></li>
            </ul>
          </div>
        </div>

        {/* Company Info */}
        <div className="loginpage-footer-companies">
          <div className="loginpage-company">
            <strong>ORANGE SEA CORP</strong>
            <p>80 main street, Po BOX 3200, Road Town, Tortola VG1110, Ilhas Virgens Britânicas</p>
          </div>
          <div className="loginpage-company">
            <strong>QMS520 TECHNOLOGY INTERNATIONAL</strong>
            <p>Aida Avenue, Estoril Garden, Bloco 1, Room 112, Estoril, Cascais, Lisboa</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;