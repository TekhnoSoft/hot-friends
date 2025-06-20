import React, { useState, useEffect, useCallback } from 'react';
import { useMainContext } from '../../helpers/MainContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Feed from '../../components/Feed';
import RecommendedProfiles from '../../components/RecommendedProfiles';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import './style.css';

const Home = () => {
  const { user } = useMainContext();
  const [posts, setPosts] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - substitua por chamadas reais da API
  const mockPosts = [
    {
      id: 1,
      author: {
        name: "BAD M**",
        avatar: "https://picsum.photos/44/44?random=1"
      },
      description: "Novo conteúdo exclusivo disponível! 🔥",
      type: "image",
      mediaUrl: "https://picsum.photos/600/400?random=1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      likesCount: 142,
      commentsCount: 23,
      isLiked: false,
      comments: [
        {
          author: { name: "João", avatar: "https://picsum.photos/32/32?random=10" },
          text: "Incrível! 😍",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 2,
      author: {
        name: "GABY",
        avatar: "https://picsum.photos/44/44?random=2"
      },
      description: "Aproveitando o dia lindo! ☀️",
      type: "video",
      mediaUrl: "https://picsum.photos/600/400?random=2",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      likesCount: 89,
      commentsCount: 12,
      isLiked: true,
      comments: []
    },
    {
      id: 3,
      author: {
        name: "Clara EX BBB",
        avatar: "https://picsum.photos/44/44?random=3"
      },
      description: "Obrigada pelo carinho de vocês! ❤️",
      type: "image",
      mediaUrl: "https://picsum.photos/600/400?random=3",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
      likesCount: 256,
      commentsCount: 45,
      isLiked: false,
      comments: [
        {
          author: { name: "Maria", avatar: "https://picsum.photos/32/32?random=11" },
          text: "Você é incrível! ❤️",
          createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000)
        },
        {
          author: { name: "Pedro", avatar: "https://picsum.photos/32/32?random=12" },
          text: "Sempre arrasando! 🔥",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 4,
      author: {
        name: "Marina",
        avatar: "https://picsum.photos/44/44?random=4"
      },
      description: "Sessão de fotos de hoje! O que acharam? 📸✨",
      type: "image",
      mediaUrl: "https://picsum.photos/600/400?random=4",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      likesCount: 78,
      commentsCount: 15,
      isLiked: false,
      comments: []
    },
    {
      id: 5,
      author: {
        name: "Luana",
        avatar: "https://picsum.photos/44/44?random=5"
      },
      description: "Bom dia, meus amores! Como estão? 🌅💕",
      type: "image",
      mediaUrl: "https://picsum.photos/600/400?random=5",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 horas atrás
      likesCount: 203,
      commentsCount: 31,
      isLiked: true,
      comments: [
        {
          author: { name: "Ana", avatar: "https://picsum.photos/32/32?random=13" },
          text: "Bom dia, linda! 🌸",
          createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000)
        }
      ]
    }
  ];

  const mockProfiles = [
    {
      id: 1,
      name: "feercampos",
      username: "feercampos",
      avatar: "https://picsum.photos/40/40?random=201",
      coverImage: "https://picsum.photos/300/120?random=301",
      isVerified: true
    },
    {
      id: 2,
      name: "BAD MI",
      username: "badmi",
      avatar: "https://picsum.photos/40/40?random=202",
      coverImage: "https://picsum.photos/300/120?random=302",
      isVerified: false
    },
    {
      id: 3,
      name: "Mel Hotw...",
      username: "melhotw",
      avatar: "https://picsum.photos/40/40?random=203",
      coverImage: "https://picsum.photos/300/120?random=303",
      isVerified: true
    },
    {
      id: 4,
      name: "Marina Silva",
      username: "marina_s",
      avatar: "https://picsum.photos/40/40?random=204",
      coverImage: "https://picsum.photos/300/120?random=304",
      isVerified: false
    },
    {
      id: 5,
      name: "Luana Costa",
      username: "luana_c",
      avatar: "https://picsum.photos/40/40?random=205",
      coverImage: "https://picsum.photos/300/120?random=305",
      isVerified: true
    },
    {
      id: 6,
      name: "Camila Santos",
      username: "cami_santos",
      avatar: "https://picsum.photos/40/40?random=206",
      coverImage: "https://picsum.photos/300/120?random=306",
      isVerified: false
    },
    {
      id: 1,
      name: "feercampos",
      username: "feercampos",
      avatar: "https://picsum.photos/40/40?random=201",
      coverImage: "https://picsum.photos/300/120?random=301",
      isVerified: true
    },
    {
      id: 2,
      name: "BAD MI",
      username: "badmi",
      avatar: "https://picsum.photos/40/40?random=202",
      coverImage: "https://picsum.photos/300/120?random=302",
      isVerified: false
    },
    {
      id: 3,
      name: "Mel Hotw...",
      username: "melhotw",
      avatar: "https://picsum.photos/40/40?random=203",
      coverImage: "https://picsum.photos/300/120?random=303",
      isVerified: true
    },
    {
      id: 4,
      name: "Marina Silva",
      username: "marina_s",
      avatar: "https://picsum.photos/40/40?random=204",
      coverImage: "https://picsum.photos/300/120?random=304",
      isVerified: false
    },
    {
      id: 5,
      name: "Luana Costa",
      username: "luana_c",
      avatar: "https://picsum.photos/40/40?random=205",
      coverImage: "https://picsum.photos/300/120?random=305",
      isVerified: true
    },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Simula carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(mockPosts);
      setRecommendedProfiles(mockProfiles);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <div className="home">
      <Header />
      
      <div className="home-container">
        <div className="home-content">
          <Sidebar />
          
          <main className="main-content">
            <RecommendedProfiles profiles={recommendedProfiles} />
            <Feed posts={posts} />
          </main>
        </div>
      </div>
      
      {/* Bottom Tab Navigation - Aparece apenas no mobile */}
      <BottomTabNavigation />
    </div>
  );
};

export default Home;