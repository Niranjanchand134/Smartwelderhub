// components/welder/pages/MaterialRequestForm.js
import React, { useState } from 'react';
import { createMaterialRequest } from '../../../services/materialRequestService';
import { useAuth } from '../../../Context/AuthContext';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const MaterialRequestForm = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        materialName: '',
        materialType: 'IRON_ROD',
        quantity: '',
        unit: 'kg',
        description: '',
        priority: 'MEDIUM'
    });
    const [loading, setLoading] = useState(false);

    const materialTypes = [
        { value: 'IRON_ROD', label: 'Iron Rod' },
        { value: 'ELECTRODE', label: 'Welding Electrode' },
        { value: 'SHEET', label: 'Metal Sheet' },
        { value: 'HINGE', label: 'Hinge' },
        { value: 'PAINT', label: 'Paint' },
        { value: 'ACCESSORY', label: 'Accessory' },
        { value: 'OTHER', label: 'Other' }
    ];

    const units = ['kg', 'pieces', 'packs', 'liters', 'meters', 'sheets', 'units'];

    const priorities = [
        { value: 'LOW', label: 'Low', color: 'info' },
        { value: 'MEDIUM', label: 'Medium', color: 'warning' },
        { value: 'HIGH', label: 'High', color: 'danger' },
        { value: 'URGENT', label: 'Urgent', color: 'danger' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.materialName.trim()) {
            ErrorMessageToast('Please enter material name');
            return;
        }

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            ErrorMessageToast('Please enter a valid quantity');
            return;
        }

        if (!user || !user.id) {
            ErrorMessageToast('User information not found. Please login again.');
            return;
        }

        setLoading(true);
        try {
            const requestData = {
                welderId: user.id,
                materialName: formData.materialName.trim(),
                materialType: formData.materialType,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                description: formData.description.trim(),
                priority: formData.priority
            };

            await createMaterialRequest(requestData);
            SuccesfulMessageToast('Material request submitted successfully!');
            if (onSuccess) {
                onSuccess();
            }
            if (onClose) {
                onClose();
            }
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to submit material request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-box me-2"></i>
                            Request Material / Accessory
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="materialName" className="form-label">
                                        Material Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="materialName"
                                        name="materialName"
                                        value={formData.materialName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., MS Steel, Iron Rods, Electrodes"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="materialType" className="form-label">
                                        Material Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="materialType"
                                        name="materialType"
                                        value={formData.materialType}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        {materialTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="quantity" className="form-label">
                                        Quantity <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="unit" className="form-label">
                                        Unit <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        {units.map(unit => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="priority" className="form-label">
                                        Priority <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    >
                                        {priorities.map(priority => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12 mb-3">
                                    <label htmlFor="description" className="form-label">
                                        Description / Additional Notes
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Add any additional details about the material request..."
                                        disabled={loading}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Note:</strong> Your request will be reviewed by the admin. You will be notified once it's approved or rejected.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane me-2"></i>
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MaterialRequestForm;

