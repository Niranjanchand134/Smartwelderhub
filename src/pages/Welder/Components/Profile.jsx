// components/welder/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { getUserDetailsById, updateUserProfile } from '../../../services/authService';
import { getAllCustomOrders } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

// Welding skills/specializations options
const weldingSkills = [
    'MIG Welding',
    'TIG Welding',
    'Stick Welding (SMAW)',
    'Flux-Cored Arc Welding (FCAW)',
    'Plasma Arc Welding',
    'Gas Welding',
    'Resistance Welding',
    'Laser Welding',
    'Aluminum Welding',
    'Stainless Steel Welding',
    'Pipe Welding',
    'Structural Welding',
    'Sheet Metal Welding',
    'Automotive Welding',
    'Fabrication',
    'Welding Inspection',
    'Welding Design',
    'Custom Metal Work'
];

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [welderProfile, setWelderProfile] = useState(null);
    const [orderStats, setOrderStats] = useState({
        completedJobs: 0,
        currentJobs: 0,
        totalEarnings: 0
    });
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        skills: [],
        experience: '',
        profileImage: null
    });

    useEffect(() => {
        if (user && user.id) {
            fetchWelderProfile();
            fetchOrderStats();
        }
    }, [user]);

    const fetchWelderProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserDetailsById(user.id);
            setWelderProfile(data);
            
            // Parse skills from comma-separated string
            const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
            
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                skills: skillsArray,
                experience: data.experience ? data.experience.toString() : '',
                profileImage: data.profileImage || null
            });
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const allOrders = await getAllCustomOrders();
            const welderOrders = allOrders.filter(order => {
                try {
                    if (!order.assignedWeldersJson) return false;
                    const assignedIds = JSON.parse(order.assignedWeldersJson);
                    return assignedIds.includes(user.id);
                } catch {
                    return false;
                }
            });

            const completed = welderOrders.filter(o => 
                o.status === 'CLOSED' || o.status === 'CONFIRMED_BY_CUSTOMER'
            ).length;
            
            const inProgress = welderOrders.filter(o => 
                o.status === 'IN_PROGRESS' || o.status === 'READY_FOR_DELIVERY' || o.status === 'COMPLETED'
            ).length;

            const totalEarnings = welderOrders
                .filter(o => o.paymentStatus === 'PAID')
                .reduce((sum, o) => sum + (o.totalAmount || o.estimatedCost || 0), 0);

            setOrderStats({
                completedJobs: completed,
                currentJobs: inProgress,
                totalEarnings: totalEarnings
            });
        } catch (error) {
            console.error('Failed to fetch order stats:', error);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            ErrorMessageToast('Please upload a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            ErrorMessageToast('Image size must be less than 5MB');
            return;
        }

        try {
            const base64Image = await convertToBase64(file);
            setFormData(prev => ({
                ...prev,
                profileImage: base64Image
            }));
        } catch (error) {
            ErrorMessageToast('Failed to process image');
        }
    };

    const removeProfileImage = () => {
        setFormData(prev => ({
            ...prev,
            profileImage: null
        }));
    };

    const handleSkillToggle = (skill) => {
        setFormData(prev => {
            const currentSkills = prev.skills || [];
            const isSelected = currentSkills.includes(skill);
            const newSkills = isSelected
                ? currentSkills.filter(s => s !== skill)
                : [...currentSkills, skill];
            
            return {
                ...prev,
                skills: newSkills
            };
        });
    };

    const handleSelectAllSkills = () => {
        setFormData(prev => ({
            ...prev,
            skills: weldingSkills
        }));
    };

    const handleClearAllSkills = () => {
        setFormData(prev => ({
            ...prev,
            skills: []
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Validate required fields
            if (!formData.fullName || formData.fullName.trim().length < 2) {
                ErrorMessageToast('Full name must be at least 2 characters');
                return;
            }

            if (formData.skills.length === 0) {
                ErrorMessageToast('Please select at least one skill');
                return;
            }

            if (!formData.experience || parseFloat(formData.experience) < 0) {
                ErrorMessageToast('Please enter a valid experience (years)');
                return;
            }

            // Prepare update data
            const updateData = {
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber || '',
                skills: formData.skills, // Will be converted to comma-separated string in backend
                experience: parseFloat(formData.experience) || 0,
                profileImage: formData.profileImage || null
            };

            // Call API to update profile
            await updateUserProfile(user.id, updateData);
            SuccesfulMessageToast('Profile updated successfully!');
            setIsEditing(false);
            await fetchWelderProfile(); // Refresh profile data
            
            // Dispatch event to notify header to refresh profile image
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        if (welderProfile) {
            const skillsArray = welderProfile.skills ? welderProfile.skills.split(',').map(s => s.trim()).filter(s => s) : [];
            setFormData({
                fullName: welderProfile.fullName || '',
                email: welderProfile.email || '',
                phoneNumber: welderProfile.phoneNumber || '',
                skills: skillsArray,
                experience: welderProfile.experience ? welderProfile.experience.toString() : '',
                profileImage: welderProfile.profileImage || null
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!welderProfile) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <i className="fas fa-user-circle fa-3x text-muted mb-3"></i>
                    <h5>Profile not found</h5>
                    <p className="text-muted">Unable to load your profile information.</p>
                </div>
            </div>
        );
    }

    const skillsList = formData.skills || [];
    const completionRate = orderStats.completedJobs > 0 
        ? Math.round((orderStats.completedJobs / (orderStats.completedJobs + orderStats.currentJobs)) * 100)
        : 0;

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Profile Management</h1>
                <div className="btn-group">
                    {!isEditing ? (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="fas fa-edit me-2"></i>Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                className="btn btn-success"
                                onClick={handleSave}
                            >
                                <i className="fas fa-save me-2"></i>Save Changes
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                <i className="fas fa-times me-2"></i>Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="row">
                {/* Left Column - Profile Overview & Stats */}
                <div className="col-lg-4 mb-4">
                    {/* Profile Card */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white text-center">
                            {formData.profileImage ? (
                                <img
                                    src={formData.profileImage}
                                    alt={formData.fullName}
                                    className="rounded-circle mb-3"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid white' }}
                                />
                            ) : (
                                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                     style={{ width: '100px', height: '100px' }}>
                                    <i className="fas fa-user fa-3x text-primary"></i>
                                </div>
                            )}
                            <h5 className="font-weight-bold">{formData.fullName || 'Welder'}</h5>
                            <p className="mb-0">
                                <span className="badge bg-light text-dark">
                                    {welderProfile.status || 'ACTIVE'}
                                </span>
                            </p>
                        </div>
                        <div className="card-body text-center">
                            <div className="row text-center">
                                <div className="col-6 mb-3">
                                    <div className="text-primary fw-bold fs-4">{orderStats.completedJobs}</div>
                                    <small className="text-muted">Jobs Completed</small>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="text-success fw-bold fs-4">{completionRate}%</div>
                                    <small className="text-muted">Completion Rate</small>
                                </div>
                                <div className="col-6">
                                    <div className="text-info fw-bold fs-4">{orderStats.currentJobs}</div>
                                    <small className="text-muted">Active Jobs</small>
                                </div>
                                <div className="col-6">
                                    <div className="text-success fw-bold fs-5">
                                        Rs. {orderStats.totalEarnings.toLocaleString()}
                                    </div>
                                    <small className="text-muted">Total Earnings</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-tools me-2"></i>
                                Skills & Specialization
                            </h6>
                        </div>
                        <div className="card-body">
                            {(!isEditing && skillsList.length > 0) || (isEditing && formData.skills.length > 0) ? (
                                <div className="d-flex flex-wrap gap-2">
                                    {(isEditing ? formData.skills : skillsList).map((skill, index) => (
                                        <span key={index} className="badge bg-primary">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No skills added yet</p>
                            )}
                            {formData.experience && (
                                <div className="mt-3 pt-3 border-top">
                                    <small className="text-muted d-block mb-1">Experience</small>
                                    <span className="badge bg-info fs-6">
                                        <i className="fas fa-calendar-alt me-1"></i>
                                        {formData.experience} years
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Editable Profile Information */}
                <div className="col-lg-8">
                    {/* Personal Information */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-user me-2"></i>
                                Personal Information
                            </h6>
                            {isEditing && (
                                <span className="badge bg-warning">Editing</span>
                            )}
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        />
                                    ) : (
                                        <p className="form-control-plaintext">{formData.fullName || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <p className="form-control-plaintext">{formData.email || 'N/A'}</p>
                                    )}
                                    {isEditing && (
                                        <small className="text-muted">Email cannot be changed</small>
                                    )}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        />
                                    ) : (
                                        <p className="form-control-plaintext">{formData.phoneNumber || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Experience (Years)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.experience}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                            min="0"
                                            step="0.5"
                                        />
                                    ) : (
                                        <p className="form-control-plaintext">
                                            {formData.experience ? `${formData.experience} years` : 'N/A'}
                                        </p>
                                    )}
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label fw-bold">Profile Image</label>
                                    {formData.profileImage ? (
                                        <div className="mb-2 position-relative d-inline-block">
                                            <img
                                                src={formData.profileImage}
                                                alt="Profile"
                                                className="img-thumbnail"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                    onClick={removeProfileImage}
                                                    title="Remove image"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-muted mb-2">
                                            <i className="fas fa-user-circle fa-3x"></i>
                                            <p className="small mb-0">No profile image</p>
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleProfileImageUpload}
                                            />
                                            <small className="text-muted d-block mt-1">
                                                Max 5MB. JPG, PNG, GIF formats supported.
                                            </small>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="col-12 mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label className="form-label fw-bold mb-0">
                                                Skills / Specialization <span className="text-danger">*</span>
                                            </label>
                                            <div className="btn-group btn-group-sm" role="group">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={handleSelectAllSkills}
                                                    title="Select All Skills"
                                                >
                                                    <i className="fas fa-check-double me-1"></i>Select All
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={handleClearAllSkills}
                                                    title="Clear All Selections"
                                                >
                                                    <i className="fas fa-times me-1"></i>Clear All
                                                </button>
                                            </div>
                                        </div>
                                        <div 
                                            className="border rounded p-3"
                                            style={{ 
                                                maxHeight: '300px', 
                                                overflowY: 'auto',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        >
                                            <div className="row g-2">
                                                {weldingSkills.map(skill => {
                                                    const isSelected = formData.skills.includes(skill);
                                                    return (
                                                        <div key={skill} className="col-md-6 col-lg-4">
                                                            <div 
                                                                className={`form-check p-2 rounded ${isSelected ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-white border'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                                onClick={() => handleSkillToggle(skill)}
                                                            >
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`skill-${skill}`}
                                                                    checked={isSelected}
                                                                    onChange={() => handleSkillToggle(skill)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <label 
                                                                    className="form-check-label w-100" 
                                                                    htmlFor={`skill-${skill}`}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {skill}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {formData.skills.length > 0 && (
                                            <div className="mt-2">
                                                <div className="d-flex flex-wrap gap-2">
                                                    <span className="badge bg-primary">
                                                        <i className="fas fa-check-circle me-1"></i>
                                                        {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                                                    </span>
                                                    {formData.skills.slice(0, 5).map(skill => (
                                                        <span key={skill} className="badge bg-info">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {formData.skills.length > 5 && (
                                                        <span className="badge bg-secondary">
                                                            +{formData.skills.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-info-circle me-2"></i>
                                Account Information
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Account Status</label>
                                    <p className="form-control-plaintext">
                                        <span className={`badge ${
                                            welderProfile.status === 'ACTIVE' ? 'bg-success' : 
                                            welderProfile.status === 'VERIFIED' ? 'bg-info' : 
                                            'bg-secondary'
                                        }`}>
                                            {welderProfile.status || 'ACTIVE'}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Role</label>
                                    <p className="form-control-plaintext">
                                        <span className="badge bg-primary">{welderProfile.role || 'WELDER'}</span>
                                    </p>
                                </div>
                                {welderProfile.createdAt && (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Member Since</label>
                                        <p className="form-control-plaintext">
                                            {new Date(welderProfile.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {welderProfile.lastLogin && (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Last Login</label>
                                        <p className="form-control-plaintext">
                                            {new Date(welderProfile.lastLogin).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
