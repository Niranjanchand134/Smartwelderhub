// components/welder/WelderSidebar.js
import React from 'react';

const WelderSidebar = ({ activePage, onPageChange, collapsed }) => {
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: 'fas fa-tasks',
        },
        {
            id: 'ai-designs',
            label: 'AI Designs',
            icon: 'fas fa-robot',
        },
        {
            id: 'customer-chat',
            label: 'Customer Chat',
            icon: 'fas fa-comments',
        },
        {
            id: 'materials',
            label: 'Materials',
            icon: 'fas fa-boxes',
        },
    ];

    return (
        <aside className="bg-white border-end shadow-sm fixed-top" 
               style={{ 
                   width: collapsed ? '80px' : '250px',
                   height: '100vh',
                   top: '73px',
                   transition: 'width 0.3s ease',
                   zIndex: 1020
               }}>
            {/* Profile Summary */}
            {!collapsed && (
                <div className="p-2 border-bottom text-center">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                         style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-tools text-white fa-2x"></i>
                    </div>
                    <h6 className="mb-1">Rajesh Metal Works</h6>
                    <small className="text-muted">Welding Specialist</small>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="p-2">
                <ul className="nav nav-pills flex-column">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item mb-2">
                            <button
                                className={`nav-link w-100 text-start d-flex align-items-center ${
                                    activePage === item.id ? 'active' : ''
                                }`}
                                onClick={() => onPageChange(item.id)}
                                style={{ 
                                    borderRadius: '8px',
                                    padding: '10px 14px'
                                }}
                            >
                                <i className={`${item.icon} me-3`} style={{ width: '20px' }}></i>
                                {!collapsed && (
                                    <>
                                        <span className="flex-grow-1">{item.label}</span>
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Quick Stats - Only show when not collapsed */}
                {/* {!collapsed && (
                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="small text-uppercase text-muted mb-3">Quick Stats</h6>
                        <div className="row text-center">
                            <div className="col-6 mb-2">
                                <div className="text-primary fw-bold">5</div>
                                <small className="text-muted">New Orders</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-warning fw-bold">3</div>
                                <small className="text-muted">In Progress</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-success fw-bold">2</div>
                                <small className="text-muted">Ready</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-info fw-bold">47</div>
                                <small className="text-muted">Completed</small>
                            </div>
                        </div>
                    </div>
                )} */}
            </nav>
        </aside>
    );
};

export default WelderSidebar;