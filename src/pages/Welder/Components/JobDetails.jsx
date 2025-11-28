// components/welder/pages/JobDetails.js
import React, { useState } from 'react';

const JobDetails = ({ job, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [progress, setProgress] = useState(job?.progress || 0);

    if (!job) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4 className="text-muted">No Job Selected</h4>
                    <p className="text-muted">Please select a job to view details.</p>
                    <button className="btn btn-primary" onClick={onBack}>
                        Back to Job Management
                    </button>
                </div>
            </div>
        );
    }

    const jobDetails = {
        ...job,
        customerDetails: {
            name: job.customer,
            phone: job.customerPhone,
            location: job.customerLocation,
            email: `${job.customer.toLowerCase().replace(' ', '.')}@gmail.com`
        },
        timeline: [
            { event: 'Order Created', date: job.createdAt, status: 'completed' },
            { event: 'Assigned to Welder', date: '2024-01-16', status: 'completed' },
            { event: 'Fabrication Started', date: job.status === 'in_progress' ? '2024-01-17' : '', status: job.status === 'in_progress' ? 'completed' : 'pending' },
            { event: 'Quality Check', date: '', status: 'pending' },
            { event: 'Ready for Delivery', date: '', status: 'pending' },
            { event: 'Completed', date: job.completedAt || '', status: job.status === 'completed' ? 'completed' : 'pending' }
        ],
        materials: [
            { name: 'MS Steel', quantity: '25 kg', cost: 12500, status: 'In Stock' },
            { name: 'Welding Electrodes', quantity: '2 packs', cost: 800, status: 'In Stock' },
            { name: 'Paint & Primer', quantity: '3 liters', cost: 1500, status: 'To Order' }
        ],
        aiSuggestions: [
            {
                title: 'Structural Optimization',
                description: 'AI suggests using triangular bracing for 30% better strength',
                impact: 'Increase durability without additional cost',
                status: 'Not Applied'
            },
            {
                title: 'Material Efficiency',
                description: 'Optimized cutting pattern can save 15% material',
                impact: 'Save approximately Rs. 1,875 in material cost',
                status: 'Applied'
            }
        ]
    };

    const getStatusBadge = (status) => {
        const config = {
            assigned: { class: 'bg-warning text-dark', text: 'Assigned' },
            in_progress: { class: 'bg-primary text-white', text: 'In Progress' },
            ready_for_inspection: { class: 'bg-success text-white', text: 'Ready for Inspection' },
            completed: { class: 'bg-info text-white', text: 'Completed' },
            cancelled: { class: 'bg-danger text-white', text: 'Cancelled' }
        };
        return config[status] || { class: 'bg-light text-dark', text: status };
    };

    const getPriorityBadge = (priority) => {
        const config = {
            high: { class: 'bg-danger text-white', text: 'High Priority' },
            medium: { class: 'bg-warning text-dark', text: 'Medium Priority' },
            low: { class: 'bg-success text-white', text: 'Low Priority' }
        };
        return config[priority] || { class: 'bg-light text-dark', text: priority };
    };

    const handleUpdateProgress = (newProgress) => {
        setProgress(newProgress);
        // In real app, this would update via API
        alert(`Progress updated to ${newProgress}%`);
    };

    const handleStatusChange = (newStatus) => {
        // In real app, this would update via API
        alert(`Job status changed to ${newStatus}`);
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <div>
                    <button className="btn btn-outline-secondary me-3" onClick={onBack}>
                        <i className="fas fa-arrow-left me-2"></i>Back
                    </button>
                    <h1 className="h3 mb-0 text-gray-800 d-inline-block">
                        Job Details - #{job.id}
                    </h1>
                </div>
                <div className="btn-group">
                    <button className="btn btn-primary">
                        <i className="fas fa-print me-2"></i>Print
                    </button>
                    <button className="btn btn-outline-primary">
                        <i className="fas fa-download me-2"></i>Export
                    </button>
                </div>
            </div>

            {/* Job Header Card */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <h4 className="text-primary">{job.product}</h4>
                            <p className="lead">{job.description}</p>
                            <div className="row">
                                <div className="col-sm-6">
                                    <strong>Customer:</strong> {job.customer}<br/>
                                    <strong>Material:</strong> {job.material}<br/>
                                    <strong>Measurements:</strong> {job.measurements}
                                </div>
                                <div className="col-sm-6">
                                    <strong>Quote:</strong> Rs. {job.quote.toLocaleString()}<br/>
                                    <strong>Deadline:</strong> {job.deadline}<br/>
                                    <strong>Created:</strong> {job.createdAt}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="mb-3">
                                <span className={`badge ${getStatusBadge(job.status).class} fs-6`}>
                                    {getStatusBadge(job.status).text}
                                </span>
                            </div>
                            <div className="mb-3">
                                <span className={`badge ${getPriorityBadge(job.priority).class} fs-6`}>
                                    {getPriorityBadge(job.priority).text}
                                </span>
                            </div>
                            {job.rating && (
                                <div>
                                    <span className="badge bg-warning text-dark fs-6">
                                        <i className="fas fa-star me-1"></i>
                                        {job.rating}/5 Rating
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fas fa-info-circle me-2"></i>Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <i className="fas fa-history me-2"></i>Timeline
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('materials')}
                    >
                        <i className="fas fa-boxes me-2"></i>Materials
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'ai-suggestions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai-suggestions')}
                    >
                        <i className="fas fa-robot me-2"></i>AI Suggestions
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customer')}
                    >
                        <i className="fas fa-user me-2"></i>Customer
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="row">
                        <div className="col-lg-8">
                            {/* Progress Tracking */}
                            <div className="card shadow mb-4">
                                <div className="card-header bg-white">
                                    <h6 className="m-0 font-weight-bold text-primary">
                                        <i className="fas fa-tasks me-2"></i>
                                        Progress Tracking
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="progress mb-4" style={{ height: '25px' }}>
                                        <div 
                                            className="progress-bar progress-bar-striped progress-bar-animated" 
                                            style={{ width: `${progress}%` }}
                                        >
                                            {progress}% Complete
                                        </div>
                                    </div>
                                    <div className="btn-group w-100">
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => handleUpdateProgress(25)}
                                        >
                                            25%
                                        </button>
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => handleUpdateProgress(50)}
                                        >
                                            50%
                                        </button>
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => handleUpdateProgress(75)}
                                        >
                                            75%
                                        </button>
                                        <button 
                                            className="btn btn-outline-success"
                                            onClick={() => handleUpdateProgress(100)}
                                        >
                                            100%
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card shadow">
                                <div className="card-header bg-white">
                                    <h6 className="m-0 font-weight-bold text-primary">
                                        <i className="fas fa-bolt me-2"></i>
                                        Quick Actions
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <button className="btn btn-primary w-100 mb-2">
                                                <i className="fas fa-edit me-2"></i>Update Job Details
                                            </button>
                                            <button className="btn btn-success w-100 mb-2">
                                                <i className="fas fa-check me-2"></i>Mark as Complete
                                            </button>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <button className="btn btn-warning w-100 mb-2">
                                                <i className="fas fa-comment me-2"></i>Message Customer
                                            </button>
                                            <button className="btn btn-info w-100">
                                                <i className="fas fa-file-invoice me-2"></i>Generate Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Job Summary */}
                            <div className="card shadow">
                                <div className="card-header bg-white">
                                    <h6 className="m-0 font-weight-bold text-primary">
                                        <i className="fas fa-clipboard-list me-2"></i>
                                        Job Summary
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Estimated Time:</strong><br/>
                                        <span className="text-primary">{job.estimatedTime}</span>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Current Status:</strong><br/>
                                        <span className={`badge ${getStatusBadge(job.status).class}`}>
                                            {getStatusBadge(job.status).text}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Priority:</strong><br/>
                                        <span className={`badge ${getPriorityBadge(job.priority).class}`}>
                                            {getPriorityBadge(job.priority).text}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Days Remaining:</strong><br/>
                                        <span className="text-warning">3 days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-history me-2"></i>
                                Job Timeline
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                {jobDetails.timeline.map((event, index) => (
                                    <div key={index} className="timeline-item d-flex mb-4">
                                        <div className="timeline-marker flex-shrink-0">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                                                event.status === 'completed' ? 'bg-success' : 'bg-light'
                                            }`} style={{ width: '40px', height: '40px' }}>
                                                <i className={`fas ${
                                                    event.status === 'completed' ? 'fa-check text-white' : 'fa-clock text-muted'
                                                }`}></i>
                                            </div>
                                            {index < jobDetails.timeline.length - 1 && (
                                                <div className="timeline-line bg-light" style={{ 
                                                    height: '60px', 
                                                    width: '2px', 
                                                    margin: '0 auto' 
                                                }}></div>
                                            )}
                                        </div>
                                        <div className="timeline-content ms-3 flex-grow-1">
                                            <h6 className="mb-1">{event.event}</h6>
                                            <p className="mb-1 text-muted">
                                                {event.date || 'Not started yet'}
                                            </p>
                                            <span className={`badge ${
                                                event.status === 'completed' ? 'bg-success' : 'bg-light text-muted'
                                            }`}>
                                                {event.status === 'completed' ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-boxes me-2"></i>
                                Material Requirements
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th>Quantity</th>
                                            <th>Estimated Cost</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobDetails.materials.map((material, index) => (
                                            <tr key={index}>
                                                <td>{material.name}</td>
                                                <td>{material.quantity}</td>
                                                <td>Rs. {material.cost.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        material.status === 'In Stock' ? 'bg-success' :
                                                        material.status === 'To Order' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                        {material.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {material.status === 'To Order' && (
                                                        <button className="btn btn-sm btn-primary">
                                                            Order Now
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-secondary ms-1">
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                Total Material Cost: Rs. {jobDetails.materials.reduce((sum, mat) => sum + mat.cost, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Suggestions Tab */}
                {activeTab === 'ai-suggestions' && (
                    <div className="row">
                        {jobDetails.aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="col-lg-6 mb-4">
                                <div className="card border-left-primary shadow h-100">
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                        <h6 className="m-0 font-weight-bold text-primary">
                                            {suggestion.title}
                                        </h6>
                                        <span className={`badge ${
                                            suggestion.status === 'Applied' ? 'bg-success' : 'bg-secondary'
                                        }`}>
                                            {suggestion.status}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">{suggestion.description}</p>
                                        <div className="alert alert-success">
                                            <i className="fas fa-bolt me-2"></i>
                                            {suggestion.impact}
                                        </div>
                                        <div className="d-grid gap-2">
                                            {suggestion.status === 'Not Applied' ? (
                                                <button className="btn btn-success">
                                                    <i className="fas fa-check me-2"></i>
                                                    Apply This Suggestion
                                                </button>
                                            ) : (
                                                <button className="btn btn-outline-success" disabled>
                                                    <i className="fas fa-check-double me-2"></i>
                                                    Already Applied
                                                </button>
                                            )}
                                            <button className="btn btn-outline-primary">
                                                View Detailed Analysis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Customer Tab */}
                {activeTab === 'customer' && (
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card shadow">
                                <div className="card-header bg-white">
                                    <h6 className="m-0 font-weight-bold text-primary">
                                        <i className="fas fa-user me-2"></i>
                                        Customer Information
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Name:</strong><br/>
                                        {jobDetails.customerDetails.name}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Phone:</strong><br/>
                                        {jobDetails.customerDetails.phone}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Email:</strong><br/>
                                        {jobDetails.customerDetails.email}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Location:</strong><br/>
                                        {jobDetails.customerDetails.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card shadow">
                                <div className="card-header bg-white">
                                    <h6 className="m-0 font-weight-bold text-primary">
                                        <i className="fas fa-comments me-2"></i>
                                        Communication
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-primary">
                                            <i className="fas fa-phone me-2"></i>
                                            Call Customer
                                        </button>
                                        <button className="btn btn-success">
                                            <i className="fas fa-comment me-2"></i>
                                            Send Message
                                        </button>
                                        <button className="btn btn-info">
                                            <i className="fas fa-envelope me-2"></i>
                                            Send Email
                                        </button>
                                        <button className="btn btn-warning">
                                            <i className="fas fa-map-marker-alt me-2"></i>
                                            Get Directions
                                        </button>
                                    </div>
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <h6>Recent Communication</h6>
                                        <small className="text-muted">
                                            Last contacted: 2 hours ago<br/>
                                            Preferred contact method: Phone<br/>
                                            Response time: Within 2 hours
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetails;