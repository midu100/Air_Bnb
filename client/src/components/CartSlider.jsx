import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { 
  selectCartItems, 
  selectIsCartOpen, 
  selectCartTotal, 
  removeFromCart, 
  clearCart, 
  setCartOpen 
} from "../store/slices/cartSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { useCreateBookingMutation } from "../store/api/bookingApi";
import { HiOutlineX, HiOutlineTrash, HiOutlineCalendar, HiOutlineUserGroup } from "react-icons/hi";
import toast from "react-hot-toast";
import "./CartSlider.css";

const CartSlider = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(selectCartItems);
  const isOpen = useSelector(selectIsCartOpen);
  const totalAmount = useSelector(selectCartTotal);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const handleClose = () => {
    dispatch(setCartOpen(false));
  };

  const handleRemove = (propertyId, checkInDate) => {
    dispatch(removeFromCart({ propertyId, checkInDate }));
    toast.success("Item removed from cart", { position: "top-center" });
  };

  const handleCheckoutItem = async (item) => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed with checkout", { position: "top-center" });
      dispatch(setCartOpen(false));
      navigate("/login");
      return;
    }

    try {
      const res = await createBooking({
        propertyId: item.property._id || item.property.id,
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        guestsCount: item.guestsCount,
      }).unwrap();
      
      toast.success(res.message || "Booking created successfully!", { position: "top-center" });
      dispatch(removeFromCart({ 
        propertyId: item.property._id || item.property.id, 
        checkInDate: item.checkInDate 
      }));
      
      // Navigate to My Bookings page
      navigate("/my-bookings");
      dispatch(setCartOpen(false));
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to checkout item. Please try again.", {
        position: "top-center",
      });
    }
  };

  const handleCheckoutAll = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed with checkout", { position: "top-center" });
      dispatch(setCartOpen(false));
      navigate("/login");
      return;
    }

    let successCount = 0;
    for (const item of cartItems) {
      try {
        await createBooking({
          propertyId: item.property._id || item.property.id,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          guestsCount: item.guestsCount,
        }).unwrap();
        successCount++;
      } catch (err) {
        console.error("Failed to checkout item:", item, err);
        toast.error(`Failed to checkout ${item.property.title}: ${err?.data?.message || "error"}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully checked out ${successCount} booking(s)!`, {
        position: "top-center",
      });
      dispatch(clearCart());
      navigate("/my-bookings");
      dispatch(setCartOpen(false));
    }
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`cart-slider-overlay ${isOpen ? "open" : ""}`}
        onClick={handleClose}
      />

      {/* Cart Container */}
      <div className={`cart-slider-container ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="cart-slider-header">
          <div className="flex flex-col text-left">
            <h2 className="text-lg font-display font-extrabold text-gray-900">
              Your Stays <span className="text-bronze">Cart</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              Manage your draft bookings here
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-150 text-gray-500 hover:text-gray-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="cart-slider-items">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-bronze mb-4">
                <HiOutlineCalendar className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-[240px]">
                Add stays from any property details page to start planning your trips.
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="cart-slider-item text-left">
                <img 
                  src={item.property.thumbnail} 
                  alt={item.property.title} 
                  className="cart-slider-item-img"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {item.property.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                      {item.property.city}, {item.property.country}
                    </p>
                    
                    {/* Dates */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-2">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {new Date(item.checkInDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(item.checkOutDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold ml-1">
                        ({item.totalNights}n)
                      </span>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
                      <HiOutlineUserGroup className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.guestsCount} Guest{item.guestsCount > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-extrabold text-gray-900">
                      ${item.totalAmount}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(item.property._id || item.property.id, item.checkInDate)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                        title="Remove"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCheckoutItem(item)}
                        disabled={isLoading}
                        className="text-[10px] font-bold text-white bg-black hover:bg-neutral-800 rounded px-2.5 py-1 transition-colors cursor-pointer border-none"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-slider-footer text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500">Subtotal</span>
              <span className="text-lg font-display font-extrabold text-gray-900">
                ${totalAmount}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => dispatch(clearCart())}
                className="w-full bg-white text-black border border-gray-200 hover:bg-gray-50 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckoutAll}
                disabled={isLoading}
                className="w-full bg-espresso text-linen hover:bg-espresso-soft font-bold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isLoading ? "Processing..." : "Checkout All"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSlider;
