import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UpdatePassword } from "../../../services/authService";
import {
  ErrorMessageToast,
  SuccesfulMessageToast,
} from "../../../utils/Tostify.util";
import Header from "../component/Header";

const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get email from navigation state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect back to forgot password
      ErrorMessageToast("Please complete OTP verification first");
      navigate("/forgetpassword");
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!email) {
      ErrorMessageToast("Email is missing. Please start over.");
      navigate("/forgetpassword");
      return;
    }

    setLoading(true);

    try {
      const response = await UpdatePassword({ email, password });
      
      // Backend returns string directly: "Password updated successfully"
      if (response.status === 200 || response.data === "Password updated successfully" || (typeof response.data === 'string' && response.data.includes("successfully"))) {
        SuccesfulMessageToast("Password updated successfully! Please login with your new password.");
        navigate("/login");
      } else {
        ErrorMessageToast("Failed to update password. Please try again.");
      }
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to update password. Please try again.";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data || "Please verify OTP first";
        } else if (error.response.status === 500) {
          errorMessage = error.response.data || "Server error occurred.";
        }
      }
      ErrorMessageToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/verifyOTP", { state: { email } });
  };

  return (
    <>
      <Header />
      <div
        className="w-100 d-flex justify-content-center bg-light align-items-center"
        style={{
          minHeight: "calc(102vh - 80px)",
        }}
      >
        <div className="bg-white rounded p-4 w-100 shadow-lg" style={{ maxWidth: "500px" }}>
          <h4 className="text-center mb-3">Change Password</h4>
          <p className="text-muted text-center mb-4">
            Enter your new password for <br />
            <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.password && (
                <span className="text-danger small mt-1 d-block">{errors.password}</span>
              )}
              <small className="text-muted">Password must be at least 6 characters long</small>
            </div>

            <div className="form-group mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-danger small mt-1 d-block">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="d-flex gap-3 mt-4 justify-content-end">
              <button
                type="button"
                onClick={handleBack}
                className="btn border-warning"
                style={{ width: "90px", height: "40px" }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary py-2 px-4 rounded text-white fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;

