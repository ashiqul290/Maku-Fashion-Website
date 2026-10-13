import React from 'react';
import { Heart, Store } from 'lucide-react';
import { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface WishlistPageProps {
  products: Product[];
  isLoading: boolean;
  onViewProduct: (product: Product) => void;
  onBrowseShop: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  products,
  isLoading,
  onViewProduct,
  onBrowseShop
}) => {
  const { wishlistIds } = useWishlist();
  const wishlistProducts = products.filter(product => wishlistIds.includes(product._id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20 sm:pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-7 sm:mb-10">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F7F1E4] text-[#B38838]">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#1F1D1B]">My Wishlist</h1>
        <p className="text-xs sm:text-sm text-[#786A5E] font-light">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'saved item' : 'saved items'} you love
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="bg-white rounded-xl border border-[#EFE8DF] overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-[#F5EFEB]" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 bg-[#EFE8DF] rounded w-3/4" />
                <div className="h-4 bg-[#EFE8DF] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8DFD8] p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFD8] flex items-center justify-center mx-auto text-[#B38838]">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1F1D1B]">Your wishlist is empty</h2>
            <p className="text-xs text-[#786A5E] mt-1">Save your favourite pieces here to find them easily later.</p>
          </div>
          <button
            onClick={onBrowseShop}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F1D1B] text-[#FAF8F5] text-xs uppercase tracking-widest rounded-xl hover:bg-[#3D3732] transition-colors"
          >
            <Store className="w-4 h-4 text-[#D9B96E]" />
            Browse Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product._id} product={product} onViewDetails={onViewProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
