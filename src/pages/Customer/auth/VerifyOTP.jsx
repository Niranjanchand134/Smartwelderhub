import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckOtp } from "../../../services/authService";
import {
  ErrorMessageToast,
  SuccesfulMessageToast,
} from "../../../utils/Tostify.util";
import Header from "../component/Header";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from navigation state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect back to forgot password
      ErrorMessageToast("Please start from forgot password page");
      navigate("/forgetpassword");
    }
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{5}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setError("");
      // Focus last input
      inputRefs.current[4]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 5) {
      setError("Please enter the complete 5-digit OTP");
      return;
    }

    if (!email) {
      setError("Email is missing. Please start over.");
      navigate("/forgetpassword");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await CheckOtp({ email, otp: otpCode });
      
      // Backend returns string directly: "OTP verified successfully"
      if (response === "OTP verified successfully" || (typeof response === 'object' && response.message === "OTP verified successfully")) {
        SuccesfulMessageToast("OTP verified successfully");
        navigate("/changePassword", { state: { email } });
      } else {
        setError("Invalid OTP. Please try again.");
        ErrorMessageToast("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to verify OTP. Please try again.";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data || "Invalid or expired OTP";
        } else if (error.response.status === 500) {
          errorMessage = error.response.data || "Server error occurred.";
        }
      }
      setError(errorMessage);
      ErrorMessageToast(errorMessage);
      // Clear OTP on error
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/forgetpassword");
  };

  const handleResend = () => {
    navigate("/forgetpassword", { state: { email, resend: true } });
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
          <h4 className="text-center mb-3">Verify OTP</h4>
          <p className="text-muted text-center mb-4">
            We've sent a 5-digit OTP to <br />
            <strong>{email}</strong>
          </p>

          <div className="mb-4">
            <label className="form-label">Enter OTP</label>
            <div className="d-flex justify-content-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="form-control text-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  disabled={loading}
                />
              ))}
            </div>
            {error && (
              <span className="text-danger small mt-2 d-block text-center">{error}</span>
            )}
          </div>

          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0"
              onClick={handleResend}
              disabled={loading}
            >
              Didn't receive OTP? Resend
            </button>
          </div>

          <div className="d-flex gap-3 mt-4 justify-content-end">
            <button
              onClick={handleBack}
              className="btn border-warning"
              style={{ width: "90px", height: "40px" }}
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleVerify}
              className="btn btn-primary py-2 px-4 rounded text-white fw-semibold"
              disabled={loading || otp.join("").length !== 5}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;

