import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useHealth } from '../hooks/useHealth';

export const MainLayout = () => {
  const { health, loading, refetch } = useHealth(30000); // refresh every 30s

  const isConnected = !!health && health.status === 'UP';
  const isDbConnected = !!health?.database?.connected;

  return (
    <div className="app-container">
      <Header 
        isConnected={isConnected} 
        isDbConnected={isDbConnected} 
        onRefresh={refetch} 
        loading={loading} 
      />
      <main className="main-content">
        <Outlet context={{ health, loading, refetch }} />
      </main>
      <Footer />
    </div>
  );
};
