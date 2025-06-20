import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMainContext } from '../../helpers/MainContext';
import './style.css';

const AuthLayout = ({ children }) => {
  const { authenticated, loading } = useMainContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !authenticated) {
      navigate('/login');
    }
  }, [authenticated, loading, navigate]);
  
  if (loading) {
    return (
      <div>
        <p>Carregando...</p>
      </div>
    );
  }
  
  if (!authenticated) {
    return null;
  }
  
  return (
    <div>
      {children}
    </div>
  );
};

export default AuthLayout;