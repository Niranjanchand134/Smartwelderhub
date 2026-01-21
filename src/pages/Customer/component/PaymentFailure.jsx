import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkEsewaStatus } from "../../../services/paymentService";
import { ErrorMessageToast } from "../../../utils/Tostify.util";
import { useTranslation } from "react-i18next";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Clear pending order from session
    sessionStorage.removeItem("pendingEsewaOrderId");
  }, []);

  const handleRetryPayment = () => {
    navigate("/checkout");
  };

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      const data = searchParams.get("data");
      
      if (data) {
        try {
          const decodedData = atob(data);
          const paymentResponse = JSON.parse(decodedData);
          
          const statusResult = await checkEsewaStatus({
            productCode: paymentResponse.product_code || "EPAYTEST",
            transactionUuid: paymentResponse.transaction_uuid,
            totalAmount: paymentResponse.total_amount,
          });
          
          if (statusResult.status === "COMPLETE") {
            ErrorMessageToast(
              "Payment was successful! Please contact support to update your order."
            );
          } else {
            ErrorMessageToast(
              `Payment status: ${statusResult.status || "Unknown"}`
            );
          }
        } catch (e) {
          ErrorMessageToast("Could not check payment status");
        }
      } else {
        ErrorMessageToast("No payment data available to check");
      }
    } catch (error) {
      ErrorMessageToast("Failed to check payment status");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <div className="mb-3">
                <i
                  className="fas fa-times-circle text-danger"
                  style={{ fontSize: "4rem" }}
                ></i>
              </div>
              <h4 className="text-danger mb-3">Payment Failed</h4>
              <p className="text-muted mb-4">
                Your payment could not be processed. This could be due to:
              </p>
              <ul className="text-start text-muted mb-4">
                <li>Insufficient balance in your eSewa account</li>
                <li>Transaction was cancelled</li>
                <li>Network or server error</li>
                <li>Session expired</li>
              </ul>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={handleRetryPayment}
                >
                  Try Again
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCheckStatus}
                  disabled={checking}
                >
                  {checking ? "Checking..." : "Check Status"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/")}
                >
                  Go Home
                </button>
              </div>
              <p className="text-muted small mt-3">
                If the amount was deducted from your account, please contact
                support with your transaction details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
