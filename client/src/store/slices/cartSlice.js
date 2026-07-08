import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem("airbnb_cart");
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (e) {
    console.error("Could not load cart", e);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("airbnb_cart", JSON.stringify(items));
  } catch (e) {
    console.error("Could not save cart", e);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload; // { property, checkInDate, checkOutDate, guestsCount, totalNights, totalAmount }
      // Avoid duplicate booking for the exact same property and dates
      const existsIndex = state.items.findIndex(
        (item) =>
          item.property._id === newItem.property._id &&
          item.checkInDate === newItem.checkInDate &&
          item.checkOutDate === newItem.checkOutDate
      );

      if (existsIndex === -1) {
        state.items.push(newItem);
      } else {
        // Update details if it already exists
        state.items[existsIndex] = newItem;
      }
      saveCartToStorage(state.items);
      state.isCartOpen = true; // Auto open cart when adding an item
    },
    removeFromCart: (state, action) => {
      const { propertyId, checkInDate } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.property._id === propertyId && item.checkInDate === checkInDate)
      );
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectIsCartOpen = (state) => state.cart.isCartOpen;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + (item.totalAmount || 0), 0);
