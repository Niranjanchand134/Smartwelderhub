import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import "@fortawesome/fontawesome-free/css/all.min.css";
import { greeting, loginDetails, UserRegister } from "../../../services/authService";
import {
  ErrorMessageToast,
  SuccesfulMessageToast,
  WarningMessageToast,
} from "../../../utils/Tostify.util";
import { useAuth } from "../../../Context/AuthContext";
import { switchToUserSession, getActiveSessionEmail, clearUserSession, cleanupLegacyKeys, getActiveToken } from "../../../utils/sessionManager";
import Header from "../component/header";
import Footer from "../component/Footer";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  
  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register state
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
  });
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const { user, login } = useAuth();

  // Check if user is already logged in and redirect
  useEffect(() => {
    // Clean legacy keys on mount
    cleanupLegacyKeys();
    
    // Check if user is already authenticated
    if (user && user.email) {
      const userRole = user?.role?.toUpperCase();
      
      // Redirect based on role
      if (userRole === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'BUYER' || userRole === 'BUYER') {
        navigate('/', { replace: true });
      } else if (userRole === 'FARMER') {
        navigate('/Farmerlayout/Farmerdashboard', { replace: true });
      } else if (userRole === 'WELDER') {
        navigate('/welder', { replace: true });
      }
    }
  }, [user, navigate]);

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateContact = (contact) => /^98\d{8}$/.test(contact);

  // Login handlers
  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });

    let errorMsg = "";

    if (name === "email") {
      if (!value) errorMsg = "Email is required";
      else if (!validateEmail(value)) errorMsg = "Enter a valid email";
    }

    if (name === "password") {
      if (!value) errorMsg = "Password is required";
      else if (value.length < 6) errorMsg = "Password must be at least 6 characters";
    }

    setLoginErrors({ ...loginErrors, [name]: errorMsg });
  };

  // Temporarily disabled Google login
  const handleGoogleLogin = () => {
    WarningMessageToast("Google login is temporarily disabled. Please use email and password.");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    // Prevent multiple submissions
    if (isLoginLoading) return;

    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!loginForm.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = "Enter a valid email";
      valid = false;
    }

    if (!loginForm.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    // Remove hardcoded admin check - let backend handle role-based authentication

    setLoginErrors(newErrors);

    if (!valid) return;

    try {
      setIsLoginLoading(true);
      const response = await loginDetails(loginForm.email, loginForm.password);
      
      // Handle both string token (backward compatible) and object response
      const token = typeof response === 'string' ? response : response.token || response;
      
      // Decode token to get user info
      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (e) {
        console.error("Error decoding token:", e);
        throw new Error("Invalid token received");
      }
      
      const userEmail = decoded.sub || decoded.email;
      const userInfo = {
        email: userEmail,
        name: decoded.name || decoded.fullName,
        role: decoded.role,
        id: decoded.id,
        fullName: decoded.fullName || decoded.name,
      };
      
      // Clean legacy keys before login
      cleanupLegacyKeys();
      
      // Get current active session email
      const currentActiveEmail = getActiveSessionEmail();
      
      // If logging in as a different user, clear their session first
      if (currentActiveEmail && currentActiveEmail.toLowerCase() !== userEmail.toLowerCase()) {
        console.log(`Switching from ${currentActiveEmail} to ${userEmail}`);
        clearUserSession(currentActiveEmail);
        
        // Clear cart for previous user
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`weldpro-cart-${currentActiveEmail.toLowerCase()}`)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Switch to new user session (stores token and user info)
      switchToUserSession(userEmail, token, userInfo);
      
      // Ensure legacy keys are cleaned after storing new session
      cleanupLegacyKeys();
      
      // Update auth context
      login(token);
      SuccesfulMessageToast("Successfully Login.");
      
      // Log the decoded token for debugging
      console.log("Login successful - Token decoded:", {
        email: userEmail,
        role: decoded.role,
        tokenType: decoded.tokenType,
        id: decoded.id
      });

      setTimeout(() => {
        const role = decoded.role?.toUpperCase();

        if (role === "ADMIN" || role === "admin") {
          navigate("/admin");
        } else if (role === "BUYER" || role === "buyer") {
          navigate("/");
        } else if (role === "WELDER" || role === "welder") {
          navigate("/welder");
        } else {
          navigate("/");
        }

        window.location.reload();
      }, 2000);
    } catch (err) {
      WarningMessageToast(err.message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    setRegisterFormData({ ...registerFormData, [name]: value });
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!registerForm.name.trim()) newErrors.name = "Name is required";

    if (!registerForm.number.trim()) newErrors.contact = "Phone number is required";
    else if (!validateContact(registerForm.number))
      newErrors.contact = "Enter a valid Nepali phone number";

    if (!registerForm.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(registerForm.email))
      newErrors.email = "Enter a valid email address";

    if (!registerForm.password) newErrors.password = "Password is required";
    else if (registerForm.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isRegisterLoading) return;

    if (!validateRegisterForm()) return;

    try {
      setIsRegisterLoading(true);
      const response = await UserRegister(registerFormData);

      SuccesfulMessageToast("Register Successfully!");

      // Navigate after a short delay to show success message
      setTimeout(() => {
        setIsRightPanelActive(false); // Switch to login form
        // Reset register form
        setRegisterForm({
          name: "",
          number: "",
          email: "",
          password: "",
        });
        setRegisterFormData({
          name: "",
          number: "",
          email: "",
          password: "",
          role: "buyer",
        });
      }, 1500);
    } catch (err) {
      setRegisterErrors({ ...registerErrors, form: err.message });
      ErrorMessageToast(err.message);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  useEffect(() => {
    const response = greeting();
    console.log("here is the response", response);
  }, []);

  return (
    <>
      <Header />
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div
          className="container position-relative overflow-hidden shadow-lg"
          id="container"
          style={{
            maxWidth: "768px",
            height: "480px",
            backgroundColor: "#fff",
            transition: "all 0.6s ease-in-out",
          }}
        >
          {/* Sign Up Form */}
          <div
            className="position-absolute top-0 start-0 h-100 w-50"
            style={{
              transition: "all 0.6s ease-in-out",
              zIndex: isRightPanelActive ? 5 : 1,
              opacity: isRightPanelActive ? 1 : 0,
              transform: isRightPanelActive ? "translateX(100%)" : "translateX(0)",
            }}
          >
            <form 
              className="d-flex flex-column justify-content-center align-items-center h-100 bg-white px-5 text-center"
              onSubmit={handleRegisterSubmit}
            >
              <h2 className="fw-bold mb-3">Create Account</h2>
              
              {/* Social Login - Temporarily Disabled */}
              <div className="d-flex mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={handleGoogleLogin}
                  disabled={isRegisterLoading}
                  style={{
                    cursor: isRegisterLoading ? "not-allowed" : "pointer",
                    opacity: isRegisterLoading ? 0.6 : 1,
                  }}
                >
                  <i className="fab fa-google me-2"></i>
                  Sign up with Google
                </button>
              </div>
              
              <span className="mb-3" style={{ fontSize: "12px" }}>
                or use your email for registration
              </span>

              {/* Register Form Fields */}
              <input
                type="text"
                name="name"
                className={`form-control bg-light border-0 py-2 px-3 mb-2 ${registerErrors.name && "is-invalid"}`}
                placeholder="Name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                disabled={isRegisterLoading}
              />
              {registerErrors.name && (
                <small className="text-danger w-100 text-start">{registerErrors.name}</small>
              )}

              <input
                type="text"
                name="number"
                className={`form-control bg-light border-0 py-2 px-3 mb-2 ${registerErrors.contact && "is-invalid"}`}
                placeholder="Phone Number"
                value={registerForm.number}
                onChange={handleRegisterChange}
                disabled={isRegisterLoading}
              />
              {registerErrors.contact && (
                <small className="text-danger w-100 text-start">{registerErrors.contact}</small>
              )}

              <input
                type="email"
                name="email"
                className={`form-control bg-light border-0 py-2 px-3 mb-2 ${registerErrors.email && "is-invalid"}`}
                placeholder="Email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                disabled={isRegisterLoading}
              />
              {registerErrors.email && (
                <small className="text-danger w-100 text-start">{registerErrors.email}</small>
              )}

              <div className="w-100 mb-2">
                <input
                  type="password"
                  name="password"
                  className={`form-control bg-light border-0 py-2 px-3 ${registerErrors.password && "is-invalid"}`}
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  disabled={isRegisterLoading}
                />
                {registerErrors.password && (
                  <div className="text-start">
                  <small className="text-danger w-100">{registerErrors.password}</small>
                  </div>
                )}
              </div>

              <button
                className="btn rounded-pill border-0 py-2 px-4 mt-2 text-white fw-bold text-uppercase w-100"
                style={{
                  fontSize: "12px",
                  letterSpacing: "1px",
                  backgroundColor: isRegisterLoading ? "#cccccc" : "#CE9233",
                  border: "1px solid #fd7e14",
                  cursor: isRegisterLoading ? "not-allowed" : "pointer",
                }}
                type="submit"
                disabled={isRegisterLoading}
              >
                {isRegisterLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>

          {/* Sign In Form */}
          <div
            className="position-absolute top-0 start-0 h-100 w-50"
            style={{
              transition: "all 0.6s ease-in-out",
              zIndex: isRightPanelActive ? 1 : 5,
              opacity: isRightPanelActive ? 0 : 1,
              transform: isRightPanelActive ? "translateX(100%)" : "translateX(0)",
            }}
          >
            <form 
              className="d-flex flex-column justify-content-center align-items-center h-100 bg-white px-5 text-center"
              onSubmit={handleLoginSubmit}
            >
              <h2 className="fw-bold mb-3">Sign in</h2>
              
              {/* Social Login - Temporarily Disabled */}
              <div className="d-flex mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={handleGoogleLogin}
                  disabled={isLoginLoading}
                  style={{
                    cursor: isLoginLoading ? "not-allowed" : "pointer",
                    opacity: isLoginLoading ? 0.6 : 1,
                  }}
                >
                  <i className="fab fa-google me-2"></i>
                  Sign in with Google
                </button>
              </div>
              
              <span className="mb-3" style={{ fontSize: "12px" }}>
                or use your account
              </span>

              {/* Login Form Fields */}
              <input
                type="email"
                name="email"
                className={`form-control bg-light border-0 py-2 px-3 mb-2 ${loginErrors.email && "is-invalid"}`}
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                disabled={isLoginLoading}
              />
              {loginErrors.email && (
                <small className="text-danger w-100 text-start">{loginErrors.email}</small>
              )}

              <div className="w-100 mb-2">
                <input
                  type="password"
                  name="password"
                  className={`form-control bg-light border-0 py-2 px-3 ${loginErrors.password && "is-invalid"}`}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  disabled={isLoginLoading}
                />
                {loginErrors.password && (
                  <div className="text-start">
                  <small className="text-danger w-100">{loginErrors.password}</small>
                  </div>
                )}
              </div>

              <a href="/forgetpassword" className="mb-3" style={{ fontSize: "14px" }}>
                Forgot your password?
              </a>

              <button
                className="btn rounded-pill border-0 py-2 px-4 mt-1 text-white fw-bold text-uppercase w-100"
                style={{
                  fontSize: "12px",
                  letterSpacing: "1px",
                  backgroundColor: isLoginLoading ? "#cccccc" : "#CE9233",
                  border: "1px solid #49A760",
                  cursor: isLoginLoading ? "not-allowed" : "pointer",
                }}
                type="submit"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  "LogIn"
                )}
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div
            className="position-absolute top-0 start-50 h-100 w-50 overflow-hidden"
            style={{
              transition: "transform 0.6s ease-in-out",
              zIndex: 100,
              transform: isRightPanelActive ? "translateX(-100%)" : "translateX(0)",
            }}
          >
            <div
              className="position-relative h-100"
              style={{
                width: "200%",
                left: "-100%",
                transition: "transform 0.6s ease-in-out",
                background: "linear-gradient(to right, #CE9233, #CE9233)",
                color: "#FFFFFF",
                transform: isRightPanelActive
                  ? "translateX(50%)"
                  : "translateX(0)",
              }}
            >
              {/* Overlay Left */}
              <div className="position-absolute top-0 start-0 h-100 w-50 d-flex flex-column justify-content-center align-items-center text-center px-5">
                <h1 className="fw-bold text-white">Welcome Back!</h1>
                <p className="my-3">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="btn rounded-pill border border-white py-2 px-4 text-white fw-bold text-uppercase"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                  onClick={() => setIsRightPanelActive(false)}
                >
                  Sign In
                </button>
              </div>

              {/* Overlay Right */}
              <div className="position-absolute top-0 end-0 h-100 w-50 d-flex flex-column justify-content-center align-items-center text-center px-5">
                <h1 className="fw-bold text-white">Hello, Friend!</h1>
                <p className="my-3">
                  Enter your personal details and start journey with us
                </p>
                <button
                  className="btn rounded-pill border border-white py-2 px-4 text-white fw-bold text-uppercase"
                  style={{ fontSize: "12px", letterSpacing: "1px" }}
                  onClick={() => setIsRightPanelActive(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginRegister;