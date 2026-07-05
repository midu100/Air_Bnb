export const ADMIN_STATS = {
  totalRevenue: 24500,
  totalBookings: 148,
  activeListings: 32,
  averageRating: 4.85
};

export const REVENUE_CHART_DATA = [
  { month: 'Jan', revenue: 4000, costs: 1500, profit: 2500 },
  { month: 'Feb', revenue: 4500, costs: 1800, profit: 2700 },
  { month: 'Mar', revenue: 5200, costs: 2000, profit: 3200 },
  { month: 'Apr', revenue: 6100, costs: 2200, profit: 3900 },
  { month: 'May', revenue: 5800, costs: 2100, profit: 3700 },
  { month: 'Jun', revenue: 7500, costs: 2500, profit: 5000 },
  { month: 'Jul', revenue: 8900, costs: 3000, profit: 5900 }
];

export const BOOKINGS_CHART_DATA = [
  { month: 'Jan', bookings: 25 },
  { month: 'Feb', bookings: 28 },
  { month: 'Mar', bookings: 35 },
  { month: 'Apr', bookings: 42 },
  { month: 'May', bookings: 38 },
  { month: 'Jun', bookings: 55 },
  { month: 'Jul', bookings: 68 }
];

export const RECENT_BOOKINGS = [
  {
    id: 'BK-9021',
    guest: { fullName: 'Alex Rivera', email: 'alex@example.com', avatar: 'AR' },
    property: 'Minimalist A-Frame Cabin',
    checkInDate: '2026-07-10',
    checkOutDate: '2026-07-14',
    totalNights: 4,
    totalAmount: 856,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid'
  },
  {
    id: 'BK-9022',
    guest: { fullName: 'Sarah Connor', email: 'sarah@example.com', avatar: 'SC' },
    property: 'Luxury Sunset Beachfront Villa',
    checkInDate: '2026-07-15',
    checkOutDate: '2026-07-20',
    totalNights: 5,
    totalAmount: 3450,
    bookingStatus: 'pending',
    paymentStatus: 'pending'
  },
  {
    id: 'BK-9023',
    guest: { fullName: 'John Doe', email: 'john@example.com', avatar: 'JD' },
    property: 'Modern Geometric Glass Oasis',
    checkInDate: '2026-07-02',
    checkOutDate: '2026-07-05',
    totalNights: 3,
    totalAmount: 3150,
    bookingStatus: 'completed',
    paymentStatus: 'paid'
  },
  {
    id: 'BK-9024',
    guest: { fullName: 'Emma Watson', email: 'emma@example.com', avatar: 'EW' },
    property: '18th Century Countryside Manor',
    checkInDate: '2026-07-22',
    checkOutDate: '2026-07-25',
    totalNights: 3,
    totalAmount: 2625,
    bookingStatus: 'cancelled',
    paymentStatus: 'refunded'
  },
  {
    id: 'BK-9025',
    guest: { fullName: 'Michael Scott', email: 'michael@example.com', avatar: 'MS' },
    property: 'Eco-Friendly Earth House',
    checkInDate: '2026-07-05',
    checkOutDate: '2026-07-08',
    totalNights: 3,
    totalAmount: 485,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid'
  }
];

export const MOCK_ADMIN_CATEGORIES = [
  { _id: 'cat_1', name: 'Cabins', slug: 'cabins', description: 'Cozy remote wooden cabins', thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat_2', name: 'Beachfront', slug: 'beachfront', description: 'Stunning properties right on the shore', thumbnail: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat_3', name: 'Mansions', slug: 'mansions', description: 'Huge, high-end luxury estates', thumbnail: 'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=400&q=80' },
  { _id: 'cat_4', name: 'Pools', slug: 'pools', description: 'Homes with incredible, designer swimming pools', thumbnail: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80' }
];

export const MOCK_ADMIN_AMENITIES = [
  { _id: 'am_1', name: 'Wifi', icon: 'FaWifi' },
  { _id: 'am_2', name: 'Pool', icon: 'FaSwimmingPool' },
  { _id: 'am_3', name: 'Air Conditioning', icon: 'FaWind' },
  { _id: 'am_4', name: 'Kitchen', icon: 'FaUtensils' },
  { _id: 'am_5', name: 'Free Parking', icon: 'FaCar' },
  { _id: 'am_6', name: 'Hot Tub', icon: 'FaHotTub' },
  { _id: 'am_7', name: 'Gym', icon: 'FaDumbbell' }
];

export const MOCK_ADMIN_REVIEWS = [
  {
    _id: 'rev_1',
    property: 'Minimalist A-Frame Cabin',
    user: { fullName: 'Sarah Connor', profileImg: '' },
    rating: 5,
    comment: 'Absolutely stunning view! The hot tub was perfect at night. Highly recommend.',
    createdAt: '2026-06-28'
  },
  {
    _id: 'rev_2',
    property: 'Minimalist A-Frame Cabin',
    user: { fullName: 'John Doe', profileImg: '' },
    rating: 4,
    comment: 'Great cozy cabin, but wifi was a bit spotty in the evenings.',
    createdAt: '2026-06-25'
  },
  {
    _id: 'rev_3',
    property: 'Luxury Sunset Beachfront Villa',
    user: { fullName: 'Alex Rivera', profileImg: '' },
    rating: 5,
    comment: 'This place is a dream. Waking up to the ocean waves was irreplaceable.',
    createdAt: '2026-06-20'
  }
];

export const MOCK_ADMIN_PAYMENTS = [
  {
    _id: 'pay_1',
    transactionId: 'TXN-90234123',
    booking: { checkInDate: '2026-07-10', checkOutDate: '2026-07-14', totalAmount: 856, bookingStatus: 'confirmed' },
    user: { fullName: 'Alex Rivera', email: 'alex@example.com' },
    paymentMethod: 'stripe',
    amount: 856,
    status: 'paid',
    createdAt: '2026-06-25'
  },
  {
    _id: 'pay_2',
    transactionId: 'TXN-87623411',
    booking: { checkInDate: '2026-07-15', checkOutDate: '2026-07-20', totalAmount: 3450, bookingStatus: 'pending' },
    user: { fullName: 'Sarah Connor', email: 'sarah@example.com' },
    paymentMethod: 'paypal',
    amount: 3450,
    status: 'pending',
    createdAt: '2026-06-26'
  },
  {
    _id: 'pay_3',
    transactionId: 'TXN-55412348',
    booking: { checkInDate: '2026-07-02', checkOutDate: '2026-07-05', totalAmount: 3150, bookingStatus: 'completed' },
    user: { fullName: 'John Doe', email: 'john@example.com' },
    paymentMethod: 'Bkash',
    amount: 3150,
    status: 'paid',
    createdAt: '2026-06-15'
  },
  {
    _id: 'pay_4',
    transactionId: 'TXN-44123990',
    booking: { checkInDate: '2026-07-22', checkOutDate: '2026-07-25', totalAmount: 2625, bookingStatus: 'cancelled' },
    user: { fullName: 'Emma Watson', email: 'emma@example.com' },
    paymentMethod: 'stripe',
    amount: 2625,
    status: 'refunded',
    createdAt: '2026-06-22'
  }
];

export const MOCK_ADMIN_GUESTS = [
  { fullName: 'Alex Rivera', email: 'alex@example.com', phone: '+1 (555) 019-2834', totalBookings: 3, joinDate: '2025-11-12' },
  { fullName: 'Sarah Connor', email: 'sarah@example.com', phone: '+1 (555) 014-9988', totalBookings: 2, joinDate: '2026-01-05' },
  { fullName: 'John Doe', email: 'john@example.com', phone: '+1 (555) 012-3456', totalBookings: 5, joinDate: '2025-05-18' },
  { fullName: 'Emma Watson', email: 'emma@example.com', phone: '+1 (555) 015-8822', totalBookings: 1, joinDate: '2026-03-24' },
  { fullName: 'Michael Scott', email: 'michael@example.com', phone: '+1 (555) 017-4455', totalBookings: 4, joinDate: '2025-08-09' }
];
