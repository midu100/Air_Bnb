import React from "react";
import { useGetMyWishlistQuery, useRemoveFromWishlistMutation, useClearWishlistMutation } from "../store/api/wishlistApi";
import PropertyCard from "../components/PropertyCard";
import { HiOutlineHeart, HiOutlineTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const Wishlist = () => {
  const { data, isLoading, error, refetch } = useGetMyWishlistQuery();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();

  const handleRemove = async (propertyId) => {
    try {
      await removeFromWishlist(propertyId).unwrap();
      toast.success("Removed from wishlist", { position: "top-center" });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to remove item.");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      try {
        await clearWishlist().unwrap();
        toast.success("Wishlist cleared", { position: "top-center" });
        refetch();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Failed to clear wishlist.");
      }
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans min-h-[70vh]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div className="text-left">
          <h1 className="text-3xl font-display font-extrabold text-gray-900">
            My <span className="text-bronze">Wishlist</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse stays you have saved for later
          </p>
        </div>
        
        {data?.properties?.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-transparent active:scale-95 self-start"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Clear All Saved
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-bold border border-dashed border-gray-200 rounded-3xl">
          LOADING WISHLIST...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold border border-dashed border-gray-200 rounded-3xl">
          FAILED TO LOAD WISHLIST. PLEASE LOGIN OR TRY AGAIN.
        </div>
      ) : !data?.properties || data.properties.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm p-16 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-bronze mb-4">
            <HiOutlineHeart className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">No Saved Properties</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Save items to your wishlist by clicking the heart icon on any property card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.properties.map((property) => (
            <div key={property._id || property.id} className="relative group">
              {/* Custom remove tag overlay */}
              <button 
                onClick={() => handleRemove(property._id || property.id)}
                disabled={isRemoving}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-bronze flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer border-none"
                title="Remove from saved"
              >
                <HiOutlineHeart className="w-4.5 h-4.5 fill-bronze stroke-bronze" />
              </button>
              
              {/* Force clean layout by not overlapping our custom heart */}
              <div className="pointer-events-auto h-full">
                {/* Wrap in custom div but override default card's heart click by intercepting click if they click default heart, but our absolute heart is on top */}
                <PropertyCard property={property} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
