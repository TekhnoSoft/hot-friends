import React from 'react';
import Post from '../Post';
import './style.css';

const Feed = ({ posts = [] }) => {
  return (
    <div className="feed">
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <Post key={post.id || index} post={post} />
        ))
      ) : (
        <div className="feed-empty">
          <div className="empty-content">
            <h3>Nenhum post encontrado</h3>
            <p>Siga alguns criadores para ver conteúdo aqui!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;