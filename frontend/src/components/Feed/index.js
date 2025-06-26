import React, { useEffect, useRef, useCallback, useState, useContext } from 'react';
import Post from '../Post';
import './style.css';
import Api from '../../Api';
import LoadingScreen from '../LoadingScreen';
import { MainContext } from '../../helpers/MainContext';

const Feed = () => {
  const { refreshKey } = useContext(MainContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const loadingRef = useRef(null);

  const loadPosts = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await Api.getFeed(pageNumber);
      
      if (response.success && Array.isArray(response.posts)) {
        if (pageNumber === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...response.posts]);
        }
        setHasMore(response.posts.length > 0);
      } else {
        console.error('Resposta inválida da API:', response);
        setPosts([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadPosts(1);
  }, [refreshKey, loadPosts]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  }, [loading, hasMore, page, loadPosts]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [handleObserver]);

  if (!posts.length && !loading) {
    return (
      <div className="feed">
        <p>Nenhum post encontrado.</p>
      </div>
    );
  }

  return (
    <div className="feed">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onPostDeleted={handlePostDeleted}
        />
      ))}
      {loading && <LoadingScreen />}
      <div ref={loadingRef} style={{ height: '20px' }} />
    </div>
  );
};

export default Feed;