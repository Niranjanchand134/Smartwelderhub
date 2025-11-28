// src/components/AdminPanel/CreateWelder.jsx
import React, { useState } from 'react';
import { createWelder } from '../../../services/authService';
import { ErrorMessageToast, SuccesfulMessageToast } from '../../../utils/Tostify.util';

const CreateWelder = ({ setActiveMenu }) => {
  const [welderData, setWelderData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    status: 'ACTIVE',
    skills: [],
    experience: ''
  });

  const [generatePassword, setGeneratePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdWelder, setCreatedWelder] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

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
      setErrors(prev => ({ ...prev, profileImage: 'Invalid file type. Please upload an image.' }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      ErrorMessageToast('Image size must be less than 5MB');
      setErrors(prev => ({ ...prev, profileImage: 'Image size must be less than 5MB' }));
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);

      // Convert to base64
      const base64 = await convertToBase64(file);
      setProfileImage(base64);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profileImage;
        return newErrors;
      });
    } catch (error) {
      console.error('Failed to process image', error);
      ErrorMessageToast('Failed to process image. Please try another file.');
      setErrors(prev => ({ ...prev, profileImage: 'Failed to process image' }));
    }
  };

  const removeProfileImage = () => {
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImage(null);
    setProfileImagePreview(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.profileImage;
      return newErrors;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWelderData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSkillToggle = (skill) => {
    setWelderData(prev => {
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
    
    if (errors.skills) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const handleSelectAllSkills = () => {
    setWelderData(prev => ({
      ...prev,
      skills: weldingSkills
    }));
    
    if (errors.skills) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const handleClearAllSkills = () => {
    setWelderData(prev => ({
      ...prev,
      skills: []
    }));
  };

  const handlePasswordToggle = (e) => {
    const shouldGenerate = e.target.checked;
    setGeneratePassword(shouldGenerate);
    if (shouldGenerate) {
      setWelderData(prev => ({
        ...prev,
        password: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    if (!welderData.fullName || welderData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Validate email
    if (!welderData.email || !welderData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone (optional but if provided, should be valid)
    if (welderData.phone && welderData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    // Validate password if manual entry is selected
    if (!generatePassword && !welderData.password) {
      newErrors.password = 'Please enter a password or select "Generate Password"';
    }

    // Validate skills
    if (!welderData.skills || welderData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill/specialization';
    }

    // Validate experience
    if (!welderData.experience || welderData.experience === '') {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(welderData.experience) || parseFloat(welderData.experience) < 0) {
      newErrors.experience = 'Experience must be a valid number (years)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      ErrorMessageToast('Please fix the validation errors before submitting.');
      return;
    }

    const payload = {
      fullName: welderData.fullName.trim(),
      email: welderData.email.trim(),
      phone: welderData.phone.trim(),
      status: welderData.status,
      skills: welderData.skills.join(','), // Convert array to comma-separated string
      experience: parseFloat(welderData.experience)
    };

    // Include profile image if uploaded
    if (profileImage) {
      payload.profileImage = profileImage;
    }

    // Only include password if manually entered
    if (!generatePassword && welderData.password) {
      payload.password = welderData.password;
    }

    try {
      setIsSubmitting(true);
      const response = await createWelder(payload);
      
      // Store created welder info to display
      setCreatedWelder(response);
      
      SuccesfulMessageToast('Welder created successfully!');
      
      // Reset form after successful submission
      setWelderData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        status: 'ACTIVE',
        skills: [],
        experience: ''
      });
      setGeneratePassword(true);
      setProfileImage(null);
      setProfileImagePreview(null);
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setErrors({});
      
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to create welder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveMenu('customers');
  };

  const handleCreateAnother = () => {
    setCreatedWelder(null);
    setWelderData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      status: 'ACTIVE',
      skills: [],
      experience: ''
    });
    setGeneratePassword(true);
    setProfileImage(null);
    setProfileImagePreview(null);
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setErrors({});
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
        <div>
          <h2 className="mb-1">Create New Welder</h2>
          <p className="text-muted mb-0">Set up a new welder account for login access</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left me-2"></i>Back to Customers
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {createdWelder ? (
                // Success View
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="text-success mb-3">Welder Created Successfully!</h3>
                  
                  <div className="card bg-light border-0 mb-4">
                    <div className="card-body text-start">
                      <h5 className="mb-3">Welder Details</h5>
                      {createdWelder.fullName && (
                        <div className="mb-2">
                          <strong>Full Name:</strong> <span>{createdWelder.fullName}</span>
                        </div>
                      )}
                      <div className="mb-2">
                        <strong>Email:</strong> <span className="text-primary">{createdWelder.email}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> <span>{createdWelder.phone || 'N/A'}</span>
                      </div>
                      {createdWelder.skills && (
                        <div className="mb-2">
                          <strong>Skills:</strong> 
                          <div className="mt-1">
                            {createdWelder.skills.split(',').map((skill, index) => (
                              <span key={index} className="badge bg-primary me-1 mb-1">{skill.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {createdWelder.experience !== undefined && (
                        <div className="mb-2">
                          <strong>Experience:</strong> <span>{createdWelder.experience} years</span>
                        </div>
                      )}
                      <div className="mb-2">
                        <strong>Role:</strong> <span className="badge bg-info">{createdWelder.role}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Status:</strong> <span className="badge bg-success">{createdWelder.status}</span>
                      </div>
                      {createdWelder.passwordGenerated && createdWelder.generatedPassword && (
                        <div className="mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                          <strong className="text-warning">Generated Password:</strong>
                          <div className="mt-2">
                            <code className="fs-5 fw-bold text-dark">{createdWelder.generatedPassword}</code>
                          </div>
                          <small className="text-muted d-block mt-2">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Please save this password and share it with the welder securely.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={handleCreateAnother}
                    >
                      <i className="fas fa-plus me-2"></i>Create Another Welder
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleBack}
                    >
                      <i className="fas fa-users me-2"></i>View All Customers
                    </button>
                  </div>
                </div>
              ) : (
                // Form View
                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="welderFullName" className="form-label fw-bold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      id="welderFullName"
                      name="fullName"
                      value={welderData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter welder's full name"
                      minLength="2"
                      required
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback d-block">
                        {errors.fullName}
                      </div>
                    )}
                    {!errors.fullName && (
                      <small className="text-muted">Enter the welder's complete name</small>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="welderEmail" className="form-label fw-bold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="welderEmail"
                      name="email"
                      value={welderData.email}
                      onChange={handleInputChange}
                      placeholder="welder@example.com"
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        {errors.email}
                      </div>
                    )}
                    {!errors.email && (
                      <small className="text-muted">This will be used for welder login</small>
                    )}
                  </div>

                  {/* Password Section */}
                  <div className="mb-3">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="generatePassword"
                        checked={generatePassword}
                        onChange={handlePasswordToggle}
                      />
                      <label className="form-check-label" htmlFor="generatePassword">
                        <strong>Generate Password Automatically</strong>
                      </label>
                    </div>

                    {!generatePassword && (
                      <div>
                        <label htmlFor="welderPassword" className="form-label fw-bold">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="welderPassword"
                          name="password"
                          value={welderData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password manually"
                          required={!generatePassword}
                          minLength={6}
                        />
                        {errors.password && (
                          <div className="invalid-feedback d-block">
                            {errors.password}
                          </div>
                        )}
                        {!errors.password && (
                          <small className="text-muted">Minimum 6 characters</small>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label htmlFor="welderPhone" className="form-label fw-bold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="welderPhone"
                      name="phone"
                      value={welderData.phone}
                      onChange={handleInputChange}
                      placeholder="984XXXXXXX"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback d-block">
                        {errors.phone}
                      </div>
                    )}
                    {!errors.phone && (
                      <small className="text-muted">Optional - Contact number for the welder</small>
                    )}
                  </div>

                  {/* Skills / Specialization */}
                  <div className="mb-3">
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
                      className={`border rounded p-3 ${errors.skills ? 'border-danger' : 'border-secondary'}`}
                      style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa'
                      }}
                    >
                      <div className="row g-2">
                        {weldingSkills.map(skill => {
                          const isSelected = welderData.skills.includes(skill);
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
                    {errors.skills && (
                      <div className="invalid-feedback d-block mt-1">
                        {errors.skills}
                      </div>
                    )}
                    {!errors.skills && (
                      <small className="text-muted d-block mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        Click on skills to select/deselect. You can select multiple skills.
                      </small>
                    )}
                    {welderData.skills.length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-primary">
                            <i className="fas fa-check-circle me-1"></i>
                            {welderData.skills.length} skill{welderData.skills.length !== 1 ? 's' : ''} selected
                          </span>
                          {welderData.skills.slice(0, 5).map(skill => (
                            <span key={skill} className="badge bg-info">
                              {skill}
                            </span>
                          ))}
                          {welderData.skills.length > 5 && (
                            <span className="badge bg-secondary">
                              +{welderData.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="mb-3">
                    <label htmlFor="welderExperience" className="form-label fw-bold">
                      Experience (Years) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.experience ? 'is-invalid' : ''}`}
                      id="welderExperience"
                      name="experience"
                      value={welderData.experience}
                      onChange={handleInputChange}
                      placeholder="Enter years of experience"
                      min="0"
                      step="0.5"
                      required
                    />
                    {errors.experience && (
                      <div className="invalid-feedback d-block">
                        {errors.experience}
                      </div>
                    )}
                    {!errors.experience && (
                      <small className="text-muted">Enter the number of years of welding experience</small>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label htmlFor="welderStatus" className="form-label fw-bold">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="welderStatus"
                      name="status"
                      value={welderData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="VERIFIED">VERIFIED</option>
                    </select>
                    <small className="text-muted">
                      ACTIVE: Welder can login immediately | VERIFIED: Welder account is verified
                    </small>
                  </div>

                  {/* Role Info */}
                  <div className="alert alert-info mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Role:</strong> This account will be created with <strong>WELDER</strong> role automatically.
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary me-md-2"
                      onClick={handleBack}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>Create Welder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Information Sidebar */}
        <div className="col-lg-4">
          {/* Profile Image Upload */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-user-circle text-primary me-2"></i>
                Profile Image
              </h6>
            </div>
            <div className="card-body">
              {profileImagePreview ? (
                <div className="text-center mb-3">
                  <div className="position-relative d-inline-block">
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className="img-thumbnail rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                      onClick={removeProfileImage}
                      style={{ width: '30px', height: '30px', padding: 0 }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div 
                    className={`border-2 border-dashed rounded p-4 text-center bg-light ${errors.profileImage ? 'border-danger' : ''}`}
                    style={{ borderStyle: 'dashed', borderColor: errors.profileImage ? '#dc3545' : '#dee2e6' }}
                  >
                    <i className="fas fa-user-circle fs-1 text-muted mb-3"></i>
                    <p className="text-muted mb-2 small">Upload profile image</p>
                    <input
                      type="file"
                      id="profileImageUpload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                    <label 
                      htmlFor="profileImageUpload" 
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="fas fa-upload me-2"></i>Choose Image
                    </label>
                    <small className="d-block text-muted mt-2">
                      JPG, PNG, GIF (Max 5MB)
                    </small>
                    {errors.profileImage && (
                      <div className="text-danger small mt-2">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.profileImage}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!profileImagePreview && !errors.profileImage && (
                <small className="text-muted d-block text-center mt-2">
                  Optional - Profile image for the welder
                </small>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-info-circle text-info me-2"></i>
                Welder Account Setup
              </h6>
            </div>
            <div className="card-body">
              <h6 className="fw-bold mb-3">What happens after creation?</h6>
              <ul className="list-unstyled mb-0 small">
                <li className="mb-3">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <strong>Welder Account Created:</strong> A new account with WELDER role will be created
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <strong>Login Credentials:</strong> The welder can login using the email and password
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <strong>Status:</strong> Account status determines access level (ACTIVE/VERIFIED)
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <strong>Password Security:</strong> If password is auto-generated, make sure to share it securely
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Tips Card */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Best Practices
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0 small">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Use professional email addresses
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Generate secure passwords automatically
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Share credentials through secure channels
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Verify phone numbers for account recovery
                </li>
                <li>
                  <i className="fas fa-check text-success me-2"></i>
                  Set status based on verification level
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWelder;

