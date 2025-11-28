// components/welder/pages/AIDesigns.js
import React from 'react';

const AIDesigns = ({ onViewJob }) => {
    const aiSuggestions = [
        {
            id: 1,
            jobId: 101,
            customer: 'John Sharma',
            originalDesign: 'Basic Gate Design',
            aiDesign: 'Modern Geometric Gate',
            improvements: [
                'Structural strength increased by 30%',
                'Material usage optimized by 15%',
                'Fabrication time reduced by 2 hours',
                'Aesthetic appeal enhanced'
            ],
            materialSavings: 'Save 8kg of MS Steel',
            timeSavings: 'Complete in 3 days instead of 4',
            costImpact: 'Reduce cost by Rs. 2,500'
        },
        {
            id: 2,
            jobId: 102,
            customer: 'Sita Rai',
            originalDesign: 'Standard Window Grill',
            aiDesign: 'Minimalist Security Grill',
            improvements: [
                'Better airflow design',
                'Enhanced security features',
                'Easier installation',
                'Modern appearance'
            ],
            materialSavings: 'Save 3kg of Stainless Steel',
            timeSavings: 'Save 1 hour fabrication time',
            costImpact: 'Reduce cost by Rs. 1,200'
        }
    ];

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">AI Design Suggestions</h1>
                <button className="btn btn-primary">
                    <i className="fas fa-robot me-2"></i>Generate New Suggestions
                </button>
            </div>

            <div className="row">
                {aiSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="col-lg-6 mb-4">
                        <div className="card border-left-primary shadow h-100">
                            <div className="card-header bg-primary text-white">
                                <h6 className="m-0 font-weight-bold">
                                    AI Suggestion for #{suggestion.jobId}
                                </h6>
                                <small>Customer: {suggestion.customer}</small>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <h6>Original Design</h6>
                                        <p className="text-muted">{suggestion.originalDesign}</p>
                                    </div>
                                    <div className="col-6">
                                        <h6>AI Suggested Design</h6>
                                        <p className="text-primary fw-bold">{suggestion.aiDesign}</p>
                                    </div>
                                </div>

                                <h6>Improvements:</h6>
                                <ul className="list-unstyled">
                                    {suggestion.improvements.map((improvement, index) => (
                                        <li key={index} className="mb-1">
                                            <i className="fas fa-check text-success me-2"></i>
                                            {improvement}
                                        </li>
                                    ))}
                                </ul>

                                <div className="row text-center mt-3">
                                    <div className="col-4">
                                        <div className="text-success fw-bold">{suggestion.materialSavings}</div>
                                        <small className="text-muted">Material</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-warning fw-bold">{suggestion.timeSavings}</div>
                                        <small className="text-muted">Time</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-info fw-bold">{suggestion.costImpact}</div>
                                        <small className="text-muted">Cost</small>
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-success">
                                        Apply This Design
                                    </button>
                                    <button className="btn btn-outline-primary">
                                        View Job Details
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

export default AIDesigns;