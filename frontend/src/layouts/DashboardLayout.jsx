import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { ErrorBoundary } from '../components/common/ErrorComponent';
import { useHealth } from '../hooks/useHealth';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { health, loading, error, lastChecked, refetch } = useHealth(30000);

  const isConnected = !!health && health.status === 'UP';
  const isDbConnected = !!health?.database?.connected;

  return (
    <div className="app-shell">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        <TopNavbar
          onOpenMobile={() => setIsMobileOpen(true)}
          isConnected={isConnected}
          isDbConnected={isDbConnected}
        />

        <main className="content-wrapper">
          <div className="page-container">
            <ErrorBoundary>
              <Outlet context={{ health, loading, error, lastChecked, refetch }} />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
