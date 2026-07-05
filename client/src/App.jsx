import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import LayoutOne from './layout/LayoutOne'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import NotFound from './pages/NotFound'

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
import AddProperty from './pages/admin/AddProperty'
import EditProperty from './pages/admin/EditProperty'
import AddCategory from './pages/admin/AddCategory'
import AddAmenity from './pages/admin/AddAmenity'
import EditAmenity from './pages/admin/EditAmenity'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      <Routes>
        {/* Administrative panel routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/add" element={<AddProperty />} />
          <Route path="properties/edit/:id" element={<EditProperty />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/add" element={<AddCategory />} />
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
          <Route path="property/:id" element={<PropertyDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-otp" element={<VerifyOtp />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App