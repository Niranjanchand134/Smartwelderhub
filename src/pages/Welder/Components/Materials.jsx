// components/welder/pages/Materials.js
import React from 'react';

const Materials = () => {
    const materials = [
        {
            id: 1,
            name: 'MS Steel',
            currentStock: '120 kg',
            required: '45 kg',
            status: 'In Stock',
            jobs: ['Gate - John', 'Table - Anita', 'Grill - Raj'],
            reorderLevel: '50 kg'
        },
        {
            id: 2,
            name: 'Stainless Steel',
            currentStock: '15 kg',
            required: '25 kg',
            status: 'Low Stock',
            jobs: ['Window Grill - Sita', 'Railing - Mike'],
            reorderLevel: '20 kg'
        },
        {
            id: 3,
            name: 'Iron Rods',
            currentStock: '45 pieces',
            required: '30 pieces',
            status: 'In Stock',
            jobs: ['Gate - John', 'Railing - Mike'],
            reorderLevel: '20 pieces'
        },
        {
            id: 4,
            name: 'Welding Electrodes',
            currentStock: '2 packs',
            required: '5 packs',
            status: 'Order Needed',
            jobs: ['All ongoing jobs'],
            reorderLevel: '5 packs'
        }
    ];

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Material Management</h1>
                <button className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Order Materials
                </button>
            </div>

            <div className="row">
                {materials.map(material => (
                    <div key={material.id} className="col-lg-6 mb-4">
                        <div className={`card border-left-${
                            material.status === 'In Stock' ? 'success' : 
                            material.status === 'Low Stock' ? 'warning' : 'danger'
                        } shadow h-100`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h5 className="card-title text-primary">{material.name}</h5>
                                    <span className={`badge ${
                                        material.status === 'In Stock' ? 'bg-success' : 
                                        material.status === 'Low Stock' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                        {material.status}
                                    </span>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <strong>Current Stock:</strong>
                                        <div className="h5 text-success">{material.currentStock}</div>
                                    </div>
                                    <div className="col-6">
                                        <strong>Required:</strong>
                                        <div className="h5 text-warning">{material.required}</div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <strong>Jobs Requiring:</strong>
                                    <div>
                                        {material.jobs.map((job, index) => (
                                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                                {job}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    {material.status === 'Order Needed' && (
                                        <button className="btn btn-danger">
                                            <i className="fas fa-shopping-cart me-2"></i>
                                            Order Now
                                        </button>
                                    )}
                                    {material.status === 'Low Stock' && (
                                        <button className="btn btn-warning">
                                            <i className="fas fa-bell me-2"></i>
                                            Reorder Soon
                                        </button>
                                    )}
                                    <button className="btn btn-outline-primary">
                                        Update Stock
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Materials;