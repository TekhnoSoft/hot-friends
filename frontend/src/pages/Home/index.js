import React, { useState, useEffect, useCallback } from 'react';
import { useMainContext } from '../../helpers/MainContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Feed from '../../components/Feed';
import RecommendedProfiles from '../../components/RecommendedProfiles';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import Api from '../../Api';
import './style.css';

const Home = () => {
  const { user, refreshKey } = useMainContext();
  const [posts, setPosts] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (pageNumber = 1) => {
    try {
      const response = await Api.getFeed(pageNumber);
      if (response.success && Array.isArray(response.posts)) {
        if (pageNumber === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        setHasMore(response.posts.length > 0);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecommendedProfiles = useCallback(async () => {
    try {
      // Aqui você implementaria a chamada para a API de perfis recomendados
      // Por enquanto, vamos manter alguns dados mockados
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
      ];
      setRecommendedProfiles(mockProfiles);
    } catch (error) {
      console.error('Erro ao carregar perfis recomendados:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPosts(1),
        loadRecommendedProfiles()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [loadPosts, loadRecommendedProfiles]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  }, [loading, hasMore, page, loadPosts]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  if (loading && !posts.length) {
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
            <Feed 
              posts={posts} 
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loading={loading}
            />
          </main>
        </div>
      </div>
      
      {/* Bottom Tab Navigation - Aparece apenas no mobile */}
      <BottomTabNavigation />
    </div>
  );
};

export default Home;