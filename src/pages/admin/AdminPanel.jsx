// src/components/AdminPanel/AdminPanel.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import MainContent from './components/MainContent';
import ListingsPage from './components/ListingsPage';
import OrdersPage from './components/OrdersPage';
import CustomOrdersPage from './components/CustomOrdersPage';
import PaymentsPage from './components/PaymentsPage';
import CustomersPage from './components/CustomersPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import AddProduct from './components/AddProduct';
import CreateWelder from './components/CreateWelder';

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <MainContent />;
      case 'add-product':
        return <AddProduct setActiveMenu={setActiveMenu} />;
      case 'listings':
        return <ListingsPage setActiveMenu={setActiveMenu} />;
      case 'orders':
        return <OrdersPage />;
      case 'custom-orders':
        return <CustomOrdersPage />;
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
    <div className="container-fluid">
      <div className="row">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <main className="col-md-9 col-lg-10">
          <div className="mt-2">
            <AdminHeader />
          </div>
          <div className='px-md-4'>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;