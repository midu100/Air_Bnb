import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import LayoutOne from './layout/LayoutOne'
import Home from './pages/Home'
import Properties from './pages/Properties'
import MapExplore from './pages/MapExplore'
import PropertyDetails from './pages/PropertyDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

// Guest dashboard / profile pages
import MyBookings from './pages/MyBookings'
import Wishlist from './pages/Wishlist'
import MyPayments from './pages/MyPayments'
import ApplyForLease from './pages/ApplyForLease'
import MyApplications from './pages/MyApplications'
import MyLeases from './pages/MyLeases'
import Profile from './pages/Profile'
import CartSlider from './components/CartSlider'

// Auth guards
import PersistAuth from './components/common/PersistAuth'
import ProtectedRoute from './components/common/ProtectedRoute'

// Admin layout & pages
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProperties from './pages/admin/Properties'
import AdminBookings from './pages/admin/Bookings'
import AdminCategories from './pages/admin/Categories'
import AdminAmenities from './pages/admin/Amenities'
import AdminReviews from './pages/admin/Reviews'
import AdminPayments from './pages/admin/Payments'
import AdminGuests from './pages/admin/Guests'
import AdminSettings from './pages/admin/Settings'
import AdminMessages from './pages/admin/Messages'
import AdminAnalytics from './pages/admin/Analytics'
import AdminCoupons from './pages/admin/Coupons'
import AdminPayouts from './pages/admin/Payouts'
import AdminCalendar from './pages/admin/Calendar'
import AdminApplications from './pages/admin/Applications'
import AdminAssistant from './pages/admin/Assistant'
import AdminPricingRules from './pages/admin/PricingRules'
import AddProperty from './pages/admin/AddProperty'
import EditProperty from './pages/admin/EditProperty'
import AddCategory from './pages/admin/AddCategory'
import AdminDestinations from './pages/admin/Destinations'
import AddDestination from './pages/admin/AddDestination'
import EditDestination from './pages/admin/EditDestination'
import AddAmenity from './pages/admin/AddAmenity'
import EditAmenity from './pages/admin/EditAmenity'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <BrowserRouter>
      <PersistAuth>
        <ToastContainer position="top-center" autoClose={3000} theme="dark" />
        <CartSlider />
        <Routes>
          {/* Administrative panel routes — only host/admin can access */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin", "host"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/add" element={<AddProperty />} />
            <Route path="properties/edit/:id" element={<EditProperty />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="assistant" element={<AdminAssistant />} />
            <Route path="pricing-rules" element={<AdminPricingRules />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="destinations" element={<AdminDestinations />} />
            <Route path="destinations/add" element={<AddDestination />} />
            <Route path="destinations/edit/:id" element={<EditDestination />} />
            <Route path="amenities" element={<AdminAmenities />} />
            <Route path="amenities/add" element={<AddAmenity />} />
            <Route path="amenities/edit/:id" element={<EditAmenity />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="payouts" element={<AdminPayouts />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Main frontend routes */}
          <Route path="/" element={<LayoutOne />}>
            <Route index element={<Home />} />
            <Route path="properties" element={<Properties />} />
            <Route path="map" element={<MapExplore />} />
            <Route path="property/:id" element={<PropertyDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            {/* User-specific routes — must be logged in */}
            <Route path="my-bookings" element={
              <ProtectedRoute><MyBookings /></ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
            } />
            <Route path="my-payments" element={
              <ProtectedRoute><MyPayments /></ProtectedRoute>
            } />
            <Route path="apply/:id" element={
              <ProtectedRoute><ApplyForLease /></ProtectedRoute>
            } />
            <Route path="my-applications" element={
              <ProtectedRoute><MyApplications /></ProtectedRoute>
            } />
            <Route path="my-leases" element={
              <ProtectedRoute><MyLeases /></ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </PersistAuth>
    </BrowserRouter>
  )
}

export default App