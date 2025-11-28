// components/welder/WelderDashboard.js
import React, { useState } from 'react';
import Dashboard from './Components/Dashboard';
import AIDesigns from './Components/AIDesigns';
import CustomerChat from './Components/CustomerChat';
import Materials from './Components/Materials';
import JobManagement from './Components/CustomOrderManagement';
import JobDetails from './Components/JobDetails';
import WelderSidebar from './Components/WelderSidebar';
import WelderHeader from './Components/WelderHeader';
import CustomOrderManagement from './Components/CustomOrderManagement';
import Profile from './Components/Profile';

const WelderDashboard = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedJob, setSelectedJob] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard onViewJob={setSelectedJob} onNavigate={setActivePage} />;
            case 'orders':
                return <CustomOrderManagement onViewJob={setSelectedJob} onNavigate={setActivePage} />;
            case 'ai-designs':
                return <AIDesigns onViewJob={setSelectedJob} />;
            case 'customer-chat':   
                return <CustomerChat />;
            case 'materials':
                return <Materials />;
            case 'profile':
                return <Profile />;
            case 'job-details':
                return <JobDetails job={selectedJob} onBack={() => setActivePage('job-management')} />;
            default:
                return <Dashboard onViewJob={setSelectedJob} onNavigate={setActivePage} />;
        }
    };

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <WelderHeader
                onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                sidebarCollapsed={sidebarCollapsed}
                onNavigate={setActivePage}
            />
            
            <div className="d-flex flex-grow-1">
                <WelderSidebar
                    activePage={activePage}
                    onPageChange={setActivePage}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="flex-grow-1 p-4 mt-6" style={{ 
                    marginLeft: sidebarCollapsed ? '80px' : '250px',
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#f8f9fa',
                    minHeight: 'calc(100vh - 73px)'
                }}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default WelderDashboard;