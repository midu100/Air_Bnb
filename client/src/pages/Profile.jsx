import React from "react";
import { useGetProfileQuery } from "../store/api/authApi";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router";
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineUserGroup, HiOutlineLogout, HiOutlineCalendar, HiOutlineHeart, HiOutlineCreditCard } from "react-icons/hi";
import toast from "react-hot-toast";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useGetProfileQuery();
  const user = data?.userData;

  const handleLogout = () => {
    // Delete authentication cookies (optional: server-side usually HTTP-only, but clearing Redux is mandatory)
    document.cookie = "X_AS-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch(logout());
    toast.success("Logged out successfully", { position: "top-center" });
    navigate("/login");
  };

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 font-sans min-h-[70vh]">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          User <span className="text-bronze">Account</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your account profile and view activity overview
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
          LOADING USER PROFILE...
        </div>
      ) : error || !user ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">
          FAILED TO LOAD PROFILE. PLEASE LOG IN.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Card Left: Profile Image & Actions */}
          <div className="md:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-espresso shadow-sm bg-gray-50">
                <img 
                  src={user.profileImg || "https://picsum.photos/200"} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{user.fullName}</h2>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-100 text-gray-500 border border-neutral-200/50 mt-1">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-100 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Card Right: Information Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                    <HiOutlineUser className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-xs font-semibold text-gray-800">{user.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                    <HiOutlineMail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-semibold text-gray-800">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                    <HiOutlinePhone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-xs font-semibold text-gray-800">{user.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                    <HiOutlineUserGroup className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Role</p>
                    <p className="text-xs font-semibold text-gray-800 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links / Dashboard */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/my-bookings")}
                className="bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <HiOutlineCalendar className="w-5 h-5 text-bronze" />
                <span className="text-[10px] font-bold text-gray-700">My Stays</span>
              </button>
              
              <button
                onClick={() => navigate("/wishlist")}
                className="bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <HiOutlineHeart className="w-5 h-5 text-red-500" />
                <span className="text-[10px] font-bold text-gray-700">Wishlist</span>
              </button>

              <button
                onClick={() => navigate("/my-payments")}
                className="bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <HiOutlineCreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-bold text-gray-700">Payments</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
