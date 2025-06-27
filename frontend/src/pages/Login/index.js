import React, { useState, useEffect } from 'react';
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
import Api from '../../Api';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import Modal from '../../components/Modal';

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
    age: '',
    gender: '',
    cpf: '',
    role: 'user',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [googleForm, setGoogleForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [googleErrors, setGoogleErrors] = useState({});

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
      if (!formData.username) {
        newErrors.username = 'Username é obrigatório';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username deve ter pelo menos 3 caracteres';
      }
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
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
      if (isLogin) {
        // Chamada real da API de login
        const result = await Api.login(formData.email, formData.password);
        if (result.success) {
          // Salvar token no localStorage ou contexto
          localStorage.setItem('HOTFRIENDS_ACCESS_TOKEN', result.token);
          // Redirecionar para dashboard ou página principal
          window.location.href = '/';
        } else {
          setErrors({ general: result.message || 'Usuário ou senha inválidos.' });
        }
      } else {

        const data = {
          name: formData.name,
          username: formData.username?.replace("@", ""),
          email: formData.email,
          password: formData.password,
          age: Number(formData.age),
          gender: formData.gender,
          cpf: formData.cpf,
          role: formData.role,
          acceptTerms: formData.acceptTerms
        };
        const result = await Api.register(data);
        if (result.success) {
          // Exibe mensagem de sucesso e troca para login
          setIsLogin(true);
          setFormData({
            email: '', password: '', confirmPassword: '', name: '', username: '', age: '', gender: '', cpf: '', role: 'user', acceptTerms: false
          });
          setErrors({});
          alert('Cadastro realizado com sucesso! Faça login.');
        } else {
          setErrors({ general: result.message || 'Erro ao cadastrar.' });
        }
      }
    } catch (error) {
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
      age: '',
      gender: '',
      cpf: '',
      role: 'user',
      acceptTerms: false
    });
    setErrors({});
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setErrors({}); // Limpa erros anteriores
      
      // Decodifica o token para pegar o email
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const email = payload.email;

      console.log('Iniciando verificação do Google login...');

      // Primeiro, verifica o status do email
      const result = await Api.googleCheck({ 
        email, 
        googleToken: credentialResponse.credential 
      });

      console.log('Resultado da verificação:', result);
      
      if (result.success) {
        console.log('Login com sucesso, redirecionando...');
        localStorage.setItem('HOTFRIENDS_ACCESS_TOKEN', result.token);
        window.location.href = '/';
      } else if (result.needPassword) {
        console.log('Necessário criar senha, abrindo modal...');
        // Usuário precisa criar senha (novo ou existente sem senha)
        setGoogleData({ 
          email, 
          googleToken: credentialResponse.credential,
          username: result.username, // Vem preenchido se for usuário existente
          isNewUser: result.isNewUser
        });
        setShowGoogleModal(true);
      } else {
        console.log('Erro no login:', result.message);
        setErrors({ general: result.message || 'Erro ao logar com Google.' });
      }
    } catch (err) {
      console.error('Erro no login com Google:', err);
      setErrors({ general: 'Erro ao processar login com Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleModalChange = (e) => {
    const { name, value } = e.target;
    setGoogleForm(prev => ({ ...prev, [name]: value }));
    if (googleErrors[name]) setGoogleErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateGoogleModal = () => {
    const errs = {};
    if (!googleForm.username) errs.username = 'Username é obrigatório';
    if (!googleForm.password) errs.password = 'Senha é obrigatória';
    else if (googleForm.password.length < 6) errs.password = 'Senha deve ter pelo menos 6 caracteres';
    if (!googleForm.confirmPassword) errs.confirmPassword = 'Confirmação de senha é obrigatória';
    else if (googleForm.password !== googleForm.confirmPassword) errs.confirmPassword = 'Senhas não coincidem';
    setGoogleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogleModalSubmit = async (formData) => {
    try {
      const { username, password, confirmPassword } = formData;

      // Validações
      if (password !== confirmPassword) {
        setErrors({ general: 'As senhas não coincidem.' });
        return;
      }

      if (password.length < 6) {
        setErrors({ general: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
      }

      // Envia dados para o backend
      const result = await Api.googleLogin({
        email: googleData.email,
        googleToken: googleData.googleToken,
        username: googleData.username || username,
        password
      });

      if (result.success) {
        localStorage.setItem('HOTFRIENDS_ACCESS_TOKEN', result.token);
        window.location.href = '/';
      } else {
        setErrors({ general: result.message || 'Erro ao completar o cadastro.' });
      }
    } catch (err) {
      console.error('Erro ao completar cadastro:', err);
      setErrors({ general: 'Erro ao processar o cadastro.' });
    }
  };

  const handleForgotPassword = () => {
    console.log('Recuperar senha');
    // Implementar recuperação de senha
  };

  const GoogleModal = ({ isOpen, onClose }) => {
    console.log('Renderizando modal. Show:', isOpen, 'GoogleData:', googleData);
    
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      confirmPassword: ''
    });
    const [modalErrors, setModalErrors] = useState({});

    useEffect(() => {
      if (googleData?.username) {
        console.log('Atualizando username no form:', googleData.username);
        setFormData(prev => ({ ...prev, username: googleData.username }));
      }
    }, [googleData]);

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
      setModalErrors({});
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setModalErrors({});

      try {
        // Validações
        if (formData.password !== formData.confirmPassword) {
          setModalErrors({ general: 'As senhas não coincidem.' });
          return;
        }

        if (formData.password.length < 6) {
          setModalErrors({ general: 'A senha deve ter pelo menos 6 caracteres.' });
          return;
        }

        if (googleData?.isNewUser && (!formData.username || formData.username.length < 3)) {
          setModalErrors({ general: 'O nome de usuário deve ter pelo menos 3 caracteres.' });
          return;
        }

        // Envia dados para completar o cadastro/login
        const result = await Api.googleComplete({
          email: googleData.email,
          googleToken: googleData.googleToken,
          username: googleData.username || formData.username,
          password: formData.password
        });

        if (result.success) {
          localStorage.setItem('HOTFRIENDS_ACCESS_TOKEN', result.token);
          window.location.href = '/';
        } else {
          setModalErrors({ general: result.message || 'Erro ao completar o cadastro.' });
        }
      } catch (err) {
        console.error('Erro ao completar cadastro:', err);
        setModalErrors({ general: 'Erro ao processar o cadastro.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <Modal isOpen={true} onClose={onClose}>
        <div className="google-modal">
          <div className="loginpage-form-header">
            <h2>
              {googleData?.isNewUser 
                ? 'Completar Cadastro' 
                : 'Criar Senha'}
            </h2>
            <p>
              {googleData?.isNewUser 
                ? 'Complete seu cadastro para continuar' 
                : 'Crie uma senha para sua conta'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="loginpage-form">
            {modalErrors.general && (
              <div className="loginpage-error-general">
                {modalErrors.general}
              </div>
            )}
            
            {googleData?.isNewUser && (
              <div className="loginpage-input-group">
                <label className="loginpage-label">Nome de usuário <span style={{color: 'red'}}>*</span></label>
                <div className="loginpage-input-container">
                  <span className="loginpage-username-prefix">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    placeholder="username"
                    disabled={isLoading}
                    className={`loginpage-input loginpage-username-input ${modalErrors.username ? 'loginpage-input-error' : ''}`}
                  />
                </div>
                {modalErrors.username && (
                  <span className="loginpage-error">{modalErrors.username}</span>
                )}
              </div>
            )}

            <div className="loginpage-input-group">
              <label className="loginpage-label">Senha <span style={{color: 'red'}}>*</span></label>
              <div className="loginpage-input-container">
                <Lock size={20} className="loginpage-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  className={`loginpage-input ${modalErrors.password ? 'loginpage-input-error' : ''}`}
                />
                <button
                  type="button"
                  className="loginpage-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {modalErrors.password && (
                <span className="loginpage-error">{modalErrors.password}</span>
              )}
            </div>

            <div className="loginpage-input-group">
              <label className="loginpage-label">Confirmar senha <span style={{color: 'red'}}>*</span></label>
              <div className="loginpage-input-container">
                <Lock size={20} className="loginpage-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                  className={`loginpage-input ${modalErrors.confirmPassword ? 'loginpage-input-error' : ''}`}
                />
                <button
                  type="button"
                  className="loginpage-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {modalErrors.confirmPassword && (
                <span className="loginpage-error">{modalErrors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="loginpage-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loginpage-loading">
                  <div className="loginpage-spinner"></div>
                  <span>{googleData?.isNewUser ? 'Criando conta...' : 'Criando senha...'}</span>
                </div>
              ) : (
                <>
                  <span>{googleData?.isNewUser ? 'Completar Cadastro' : 'Criar Senha'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>
    );
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
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log('Login Failed');
                  setErrors({ general: 'Erro ao fazer login com Google.' });
                }}
                useOneTap
              />
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

              {isLogin ? (
                <>
                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Email <span style={{color: 'red'}}>*</span></label>
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
                    <label className="loginpage-label">Senha <span style={{color: 'red'}}>*</span></label>
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

                  <div className="loginpage-forgot-password">
                    <button 
                      type="button" 
                      className="loginpage-forgot-link"
                      onClick={handleForgotPassword}
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Nome de usuário <span style={{color: 'red'}}>*</span></label>
                    <div className="loginpage-input-container">
                      <span className="loginpage-username-prefix">@</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="username"
                        className={`loginpage-input loginpage-username-input ${errors.username ? 'loginpage-input-error' : ''}`}
                      />
                    </div>
                    {errors.username && (
                      <span className="loginpage-error">{errors.username}</span>
                    )}
                  </div>

                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Email <span style={{color: 'red'}}>*</span></label>
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
                    <label className="loginpage-label">Senha <span style={{color: 'red'}}>*</span></label>
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

                  <div className="loginpage-input-group">
                    <label className="loginpage-label">Confirmar senha <span style={{color: 'red'}}>*</span></label>
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
                        <span style={{color: 'red'}}> *</span>
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <span className="loginpage-error">{errors.acceptTerms}</span>
                    )}
                  </div>

                  <div style={{marginTop: 8, color: '#888', fontSize: 13}}>
                    Os campos marcados com <span style={{color: 'red'}}>*</span> são obrigatórios.
                  </div>
                </>
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
            <p>V 1.0.0</p>
          </div>
        </div>
      </footer>

      {/* Modal do Google */}
      {showGoogleModal && googleData && (
        <GoogleModal 
          isOpen={true} 
          onClose={() => {
            console.log('Fechando modal...');
            setShowGoogleModal(false);
            setGoogleData(null);
            setErrors({});
          }} 
        />
      )}
    </div>
  );
};

export default Login;