import React, { createContext, useContext } from 'react';

export const MainContext = createContext();

export const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext deve ser usado dentro de um MainContextProvider');
  }
  return context;
};