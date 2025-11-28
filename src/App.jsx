import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./Context/AuthContext";
import './App.css'
import Home from './pages/Customer/Home';
import './assets/css/style.css';
import './assets/css/bootstrap.min.css';
import './assets/js/custom.js';
import "./assets/lib/animate/animate.min.css";
import "./assets/lib/owlcarousel/assets/owl.carousel.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ContactUs from "./pages/Customer/component/ContactUs.jsx";
import Services from "./pages/Customer/component/Services.jsx";
import Error_404 from "./utils/Error_404.jsx";
import Login from "./pages/Customer/auth/Login.jsx";
import ForgetPassword from "./pages/Customer/auth/ForgotPassword.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import Products from "./pages/Customer/component/Products.jsx";
import ProductDetail from "./pages/Customer/component/ProductDetail.jsx";
import CartPage from "./pages/Customer/component/cart.jsx";
import CheckoutPage from "./pages/Customer/component/Checkout.jsx";
import { CartProvider } from "./pages/Customer/component/CartContext.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import UserRoute from "./components/UserRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRedirectWrapper from "./components/AdminRedirectWrapper.jsx";
import WelderRoute from "./components/WelderRoute.jsx";
import WelderDashboard from "./pages/Welder/WelderDashboard.jsx";
import CustomerOrderConfirmation from "./pages/Customer/component/CustomerOrderConfirmation.jsx";
import CustomOrderReview from "./pages/Customer/component/CustomOrderReview.jsx";
import CustomProductOrder from "./pages/Customer/component/CustomProductOrder.jsx";




function App() {  
  return (
    <>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        <ToastContainer/>
          <Routes>
            {/* Public Routes - Redirect admins to admin panel */}
            <Route 
              path="/" 
              element={
                <AdminRedirectWrapper>
                  <Home/>
                </AdminRedirectWrapper>
              }
            />
            <Route 
              path="Contactus" 
              element={
                <AdminRedirectWrapper>
                  <ContactUs/>
                </AdminRedirectWrapper>
              }
            />
            <Route 
              path="Services" 
              element={
                <AdminRedirectWrapper>
                  <Services/>
                </AdminRedirectWrapper>
              }
            />
            <Route path="Error-404" element={<Error_404/>}/>
            <Route path="login" element={<Login/>}/>
            <Route path="forgetpassword" element={<ForgetPassword/>}/>
            <Route 
              path="products" 
              element={
                <AdminRedirectWrapper>
                  <Products/>
                </AdminRedirectWrapper>
              }
            />
            <Route 
              path="/product/:productId" 
              element={
                <AdminRedirectWrapper>
                  <ProductDetail/>
                </AdminRedirectWrapper>
              }
            />

            {/* Protected User Routes - Block ADMIN access */}
            <Route 
              path="cart" 
              element={
                <UserRoute>
                  <CartPage/>
                </UserRoute>
              }
            />
            <Route 
              path="checkout" 
              element={
                <UserRoute>
                  <CheckoutPage/>
                </UserRoute>
              }
            />
            <Route 
              path="custom-product-order" 
              element={
                <AdminRedirectWrapper>
                  <CustomProductOrder/>
                </AdminRedirectWrapper>
              }
            />

            {/* Protected Admin Routes - Only ADMIN can access */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />

            <Route 
              path="/welder" 
              element={
                <WelderRoute>
                  <WelderDashboard />
                </WelderRoute>
              }
            />

            {/* Custom Order Routes */}
            <Route 
              path="/custom-order-confirmation/:id" 
              element={
                <ProtectedRoute>
                  <CustomerOrderConfirmation />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/custom-order-review/:id" 
              element={
                <ProtectedRoute>
                  <CustomOrderReview />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </>
  )
}

export default App
