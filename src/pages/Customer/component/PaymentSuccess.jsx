import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEsewaPayment, checkEsewaStatus } from "../../../services/paymentService";
import { SuccesfulMessageToast, ErrorMessageToast } from "../../../utils/Tostify.util";
import { useTranslation } from "react-i18next";
import { useCart } from "./CartContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the Base64 encoded data from query parameter
        const data = searchParams.get("data");
        const orderId = sessionStorage.getItem("pendingEsewaOrderId");
        const orderType = sessionStorage.getItem("pendingEsewaOrderType") || "regular";

        if (!data) {
          ErrorMessageToast("Payment data not found");
          setVerifying(false);
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        
        if (!orderId) {
          ErrorMessageToast("Order ID not found in session");
          setVerifying(false);
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // Decode the Base64 data to get payment response
        let paymentResponse;
        try {
          const decodedData = atob(data);
          paymentResponse = JSON.parse(decodedData);
        } catch (e) {
          ErrorMessageToast("Invalid payment response format");
          setVerifying(false);
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // Verify payment with backend
        const verifyData = {
          data: data,
          orderId: orderId,
          orderType: orderType,
          ...paymentResponse,
        };

        const result = await verifyEsewaPayment(verifyData);

        if (result.success) {
          setVerificationStatus("success");
          SuccesfulMessageToast(
            result.message || "Payment verified successfully!"
          );
          
          // Clear cart for regular orders (custom orders don't use cart)
          if (orderType === "regular") {
            clearCart();
          }
          
          // Clear pending order from session
          sessionStorage.removeItem("pendingEsewaOrderId");
          sessionStorage.removeItem("pendingEsewaOrderType");
          
          // Redirect based on order type
          setTimeout(() => {
            if (orderType === "custom") {
              navigate(`/custom-order-confirmation/${orderId}`);
            } else {
              navigate("/");
            }
          }, 3000);
        } else {
          setVerificationStatus("failed");
          ErrorMessageToast(result.message || "Payment verification failed");
          
          // If payment status is not COMPLETE, check status
          if (paymentResponse.status && paymentResponse.status !== "COMPLETE") {
            // Try status check API
            try {
              const statusResult = await checkEsewaStatus({
                productCode: paymentResponse.product_code,
                transactionUuid: paymentResponse.transaction_uuid,
                totalAmount: paymentResponse.total_amount,
              });
              
              if (statusResult.status === "COMPLETE") {
                // Retry verification
                const retryResult = await verifyEsewaPayment(verifyData);
                if (retryResult.success) {
                  setVerificationStatus("success");
                  SuccesfulMessageToast("Payment verified successfully!");
                  
                  // Clear cart for regular orders (custom orders don't use cart)
                  if (orderType === "regular") {
                    clearCart();
                  }
                  
                  sessionStorage.removeItem("pendingEsewaOrderId");
                  sessionStorage.removeItem("pendingEsewaOrderType");
                  setTimeout(() => {
                    if (orderType === "custom") {
                      navigate(`/custom-order-confirmation/${orderId}`);
                    } else {
                      navigate("/");
                    }
                  }, 3000);
                  return;
                }
              }
            } catch (statusError) {
              console.error("Status check failed:", statusError);
            }
          }
          
          setTimeout(() => navigate("/"), 5000);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus("error");
        ErrorMessageToast(
          error.message || "Failed to verify payment. Please contact support."
        );
        setTimeout(() => navigate("/"), 5000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              {verifying ? (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="mb-3">Verifying Payment...</h4>
                  <p className="text-muted">
                    Please wait while we verify your payment.
                  </p>
                </>
              ) : verificationStatus === "success" ? (
                <>
                  <div className="mb-3">
                    <i
                      className="fas fa-check-circle text-success"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h4 className="text-success mb-3">Payment Successful!</h4>
                  <p className="text-muted mb-4">
                    Your payment has been verified and your order is confirmed.
                  </p>
                  <p className="text-muted small">
                    Redirecting to home page...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <i
                      className="fas fa-exclamation-circle text-warning"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h4 className="text-warning mb-3">Payment Verification Issue</h4>
                  <p className="text-muted mb-4">
                    There was an issue verifying your payment. Please contact
                    support if the amount was deducted from your account.
                  </p>
                  <p className="text-muted small">
                    Redirecting to home page...
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
