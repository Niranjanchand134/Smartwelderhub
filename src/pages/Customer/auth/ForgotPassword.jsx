import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckEmail } from "../../../services/authService";
import {
  ErrorMessageToast,
  SuccesfulMessageToast,
} from "../../../utils/Tostify.util";
import Header from "../component/Header";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!email.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    const isEmail = /\S+@\S+\.\S+/.test(email);
    const isPhone = /^\d{7,15}$/.test(email);

    if (!isEmail && !isPhone) {
      setError("Enter a valid email or phone number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await CheckEmail({ email });
      console.log(response);
      if (response.status === 200) {
        SuccesfulMessageToast(response.data || "OTP sent successfully");
        navigate("/verifyOTP", { state: { email } });
        setEmail("");
      }
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "This email does not exist.";
        } else if (error.response.status === 500) {
          errorMessage = error.response.data || "Server error occurred.";
        }
      }
      setError(errorMessage);
      ErrorMessageToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/login");
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
        <div className="bg-white rounded p-3 w-100 shadow-lg" style={{ maxWidth: "500px" }}>
          <h4 className="text-center">Forgot password</h4>
          <p className="text-muted text-center">
            Please enter the account that you want to <br />
            reset the password.
          </p>

          <div className="form-group mb-3">
            <label htmlFor="email">Please Enter your Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mt-2"
              placeholder="Hello@gmail.com"
            />
            {error && (
              <span className="text-danger small mt-1 d-block">{error}</span>
            )}
          </div>

          <div className="d-flex gap-3 mt-5 justify-content-end text-white">
            <button
              onClick={handleBack}
              className="btn border-warning"
              style={{ width: "90px", height: "40px",  }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary py-2 px-3 rounded text-white fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;