// src/components/AdminPanel/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import MainContent from './components/MainContent';
import ListingsPage from './components/ListingsPage';
import OrdersPage from './components/OrdersPage';
import CustomOrdersPage from './components/CustomOrdersPage';
import MaterialRequestsPage from './components/MaterialRequestsPage';
import PaymentsPage from './components/PaymentsPage';
import CustomersPage from './components/CustomersPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import AddProduct from './components/AddProduct';
import CreateWelder from './components/CreateWelder';

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const mainRef = useRef(null);
  const sidebarRef = useRef(null);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const updateLayout = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      
      if (mainRef.current) {
        if (desktop) {
          mainRef.current.style.marginLeft = '250px';
        } else {
          mainRef.current.style.marginLeft = '0';
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const sidebar = sidebarRef.current;
    const main = mainRef.current;

    if (!sidebar || !main) return;

    const syncScroll = (source) => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      const sidebarScrollHeight = sidebar.scrollHeight;
      const sidebarClientHeight = sidebar.clientHeight;
      const sidebarMaxScroll = Math.max(0, sidebarScrollHeight - sidebarClientHeight);

      if (source === main) {
        const mainScrollTop = main.scrollTop;
        const mainScrollHeight = main.scrollHeight;
        const mainClientHeight = main.clientHeight;
        const mainMaxScroll = Math.max(0, mainScrollHeight - mainClientHeight);

        if (mainMaxScroll > 0 && sidebarMaxScroll > 0) {
          const scrollRatio = mainScrollTop / mainMaxScroll;
          const newSidebarScroll = scrollRatio * sidebarMaxScroll;
          
          if (newSidebarScroll <= sidebarMaxScroll) {
            sidebar.scrollTop = newSidebarScroll;
          } else if (sidebar.scrollTop < sidebarMaxScroll) {
            sidebar.scrollTop = sidebarMaxScroll;
          }
        }
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 10);
    };

    const handleMainScroll = () => syncScroll(main);

    main.addEventListener('scroll', handleMainScroll);

    return () => {
      main.removeEventListener('scroll', handleMainScroll);
    };
  }, [activeMenu, isDesktop]);

  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <MainContent setActiveMenu={setActiveMenu} />;
      case 'add-product':
        return <AddProduct setActiveMenu={setActiveMenu} />;
      case 'listings':
        return <ListingsPage setActiveMenu={setActiveMenu} />;
      case 'orders':
        return <OrdersPage />;
      case 'custom-orders':
        return <CustomOrdersPage />;
      case 'material-requests':
        return <MaterialRequestsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'create-welder':
        return <CreateWelder setActiveMenu={setActiveMenu} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="container-fluid" 
      style={{ 
        paddingLeft: 0, 
        paddingRight: 0,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex'
      }}
    >
      <Sidebar 
        ref={sidebarRef}
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />
      <main 
        ref={mainRef}
        style={{
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          paddingLeft: '15px',
          paddingRight: '15px',
          marginLeft: isDesktop ? '250px' : '0'
        }}
      >
        <div className="mt-2">
          <AdminHeader />
        </div>
        <div className='px-md-4'>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;