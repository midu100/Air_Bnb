import axios from 'axios';
import { getCookie } from '../components/common/Services';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    "content-Type": "application/json",
  }
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getCookie('X_AS-TOKEN');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authServices = {
  login: async (loginData) => {
    const res = await api.post('/auth/signin', loginData);
    return res.data;
  },
  signup: async (signupData) => {
    const res = await api.post('/auth/signUp', signupData);
    return res.data;
  },
  verifyOtp: async (otpData) => {
    const res = await api.post('/auth/verifyotp', otpData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/getprofile');
    return res.data;
  }
};

export const categoryServices = {
  create: async (formData) => {
    // Uses form-data due to upload.single('thumbnail')
    const res = await api.post('/category/create', formData, {
      headers: {
        'content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/category/allcategory');
    return res.data;
  }
};

export const propertyServices = {
  create: async (formData) => {
    // Uses multipart/form-data for thumbnails and images
    const res = await api.post('/property/create', formData, {
      headers: {
        'content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getAll: async (params) => {
    const res = await api.get('/property/all', { params });
    return res.data;
  },
  getFeatured: async () => {
    const res = await api.get('/property/featured');
    return res.data;
  },
  search: async (params) => {
    const res = await api.get('/property/search', { params });
    return res.data;
  },
  getHostProperties: async () => {
    const res = await api.get('/property/host');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/property/${id}`);
    return res.data;
  },
  update: async (id, formData) => {
    const res = await api.put(`/property/update/${id}`, formData, {
      headers: {
        'content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/property/delete/${id}`);
    return res.data;
  }
};

export const amenityServices = {
  create: async (amenityData) => {
    const res = await api.post('/amenity/create', amenityData);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/amenity/all');
    return res.data;
  },
  update: async (id, amenityData) => {
    const res = await api.put(`/amenity/update/${id}`, amenityData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/amenity/delete/${id}`);
    return res.data;
  }
};

export const bookingServices = {
  create: async (bookingData) => {
    const res = await api.post('/booking/create', bookingData);
    return res.data;
  },
  getAvailability: async (propertyId) => {
    const res = await api.get(`/booking/availability/${propertyId}`);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await api.get('/booking/mybookings');
    return res.data;
  },
  getHostBookings: async () => {
    const res = await api.get('/booking/hostbookings');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/booking/${id}`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.put(`/booking/cancel/${id}`);
    return res.data;
  },
  confirm: async (id) => {
    const res = await api.put(`/booking/confirm/${id}`);
    return res.data;
  },
  complete: async (id) => {
    const res = await api.put(`/booking/complete/${id}`);
    return res.data;
  }
};

export const reviewServices = {
  create: async (reviewData) => {
    const res = await api.post('/review/create', reviewData);
    return res.data;
  },
  getPropertyReviews: async (propertyId) => {
    const res = await api.get(`/review/property/${propertyId}`);
    return res.data;
  },
  update: async (id, reviewData) => {
    const res = await api.put(`/review/update/${id}`, reviewData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/review/delete/${id}`);
    return res.data;
  }
};

export const paymentServices = {
  create: async (paymentData) => {
    const res = await api.post('/payment/create', paymentData);
    return res.data;
  },
  getByBooking: async (bookingId) => {
    const res = await api.get(`/payment/booking/${bookingId}`);
    return res.data;
  },
  getMyPayments: async () => {
    const res = await api.get('/payment/mypayments');
    return res.data;
  },
  refund: async (id) => {
    const res = await api.put(`/payment/refund/${id}`);
    return res.data;
  }
};

export default api;
