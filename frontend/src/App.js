import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { MainContext } from "./helpers/MainContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Api from './Api';
import { setAuthToken, removeAuthToken } from './Utils';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Importação de páginas
import { Login, Home, PageNotFound, Menu, Profile, Messages, Search, Terms, Privacy, MyProfile } from './pages';

// Importação de componentes
import { LoadingScreen } from './components';

// Componente para rotas privadas
const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();
  
  // Enquanto verifica a autenticação, pode mostrar um loading
  if (loading) {
    return  <LoadingScreen />;
  }
  
  // Redireciona para login se não estiver autenticado
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Componente para rotas públicas (redireciona se já estiver logado)
const PublicRoute = ({ children, restricted = false }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();
  
  // Se a rota for restrita (como login) e o usuário estiver autenticado, redireciona para home
  if (loading) {
    return  <LoadingScreen />;
  }
  
  if (authenticated && restricted) {
    // Redireciona para a página que o usuário tentou acessar originalmente, ou para home
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return children;
};

// Hook personalizado para acessar o contexto
const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext deve ser usado dentro de um MainContextProvider');
  }
  return context;
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Verifica se há token no localStorage
      const token = localStorage.getItem("HOTFRIENDS_ACCESS_TOKEN");
      
      if (!token) {
        setAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Configura o token nos headers para as requisições
      setAuthToken(token);
      
      // Verifica se o token é válido
      const authResponse = await Api.auth();
      
      if (authResponse.status === 200) {
        // Busca os dados do usuário
        const userResponse = await Api.get();
        
        if (userResponse.status === 200 && userResponse.data.success) {
          setAuthenticated(true);
          setUser(userResponse.data.data);
        } else {
          logout(false);
        }
      } else {
        logout(false);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("HOTFRIENDS_ACCESS_TOKEN", token);
    setAuthToken(token);
    setAuthenticated(true);
    setUser(userData);
    // Força atualização dos dados do usuário após login
    loadUserData();
  };

  const logout = (reloadPage = false, callback) => {
    localStorage.removeItem("HOTFRIENDS_ACCESS_TOKEN");
    removeAuthToken();
    setAuthenticated(false);
    setUser(null);
    if (callback) {
      callback();
    }
    // Redireciona para login sem recarregar a página
    if (reloadPage) {
      window.location.href = "/login";
    }
  };

  const refreshFeed = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Valores do contexto
  const contextValue = {
    authenticated,
    user,
    setUser,
    loading,
    login,
    logout,
    refreshUserData: loadUserData,
    refreshFeed: refreshFeed,
    refreshKey
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <MainContext.Provider value={contextValue}>
      <GoogleOAuthProvider clientId="788394079086-t5isagtonb8iddmocimghl1tbahvd4l6.apps.googleusercontent.com">
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute restricted>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/terms" 
              element={<Terms />} 
            />
            <Route 
              path="/privacy" 
              element={<Privacy />} 
            />
            {/* Rotas privadas */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/menu" 
              element={
                <PrivateRoute>
                  <Menu />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/myprofile" 
              element={
                <PrivateRoute>
                  <MyProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } 
            />
            {/* Outras rotas privadas que serão adicionadas no futuro */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <div />
                </PrivateRoute>
              } 
            />
            {/* Rota para página não encontrada */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 999999 }} 
          />
        </Router>
      </GoogleOAuthProvider>
    </MainContext.Provider>
  );
}

export default App;