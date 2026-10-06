import React, { useEffect, useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBackToShop: () => void;
  onViewProduct: (product: Product) => void;
  onDirectCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBackToShop,
  onViewProduct,
  onDirectCheckout
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => setSelectedImageIndex(0), [product._id]);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || 'Default'
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'shipping'>('details');

  const inWishlist = isInWishlist(product._id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const descriptionSections = product.description.match(
    /^Overview:\n([\s\S]*?)\n\nFabric & Feel:\n([\s\S]*?)\n\nFeatures & Styling:\n([\s\S]*)$/
  );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'];

  const handleAddToCart = () => {
    // Keep the shopper on this page and open the side cart after adding.
    addToCart(product, quantity, selectedColor, selectedSize, true);
  };

  const handleOrderNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize, false);
    onDirectCheckout();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', undefined, 'info');
    }
  };

  // Related products (exclude current)
  const relatedProducts = allProducts
    .filter(p => p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-14 pb-28 sm:pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8C7C6E]">
        <button
          onClick={onBackToShop}
          className="hover:text-[#1F1D1B] transition-colors"
        >
          All Products
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F1D1B] font-medium truncate max-w-[200px] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14">
        {/* Left: Product Image Gallery (Thumbnails + Hero Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[580px] pb-1 sm:pb-0 flex-shrink-0 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-18 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-[#F5EFEB] ${
                    selectedImageIndex === idx
                      ? 'border-[#B38838] shadow-md scale-95'
                      : 'border-[#E8DFD8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Main Image Area */}
          <div className="flex-1 relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#E8DFD8] aspect-[3/4] shadow-xs">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5">
              {product.sale && (
                <span className="bg-[#B38838] text-white text-[10px] sm:text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-md">
                  On Sale
                </span>
              )}
              {product.featured && !product.sale && (
                <span className="bg-[#1F1D1B] text-[#E8DFD8] text-[10px] sm:text-xs uppercase font-medium tracking-widest px-2.5 py-1 rounded-sm shadow-md">
                  Featured
                </span>
              )}
            </div>

            {/* Wishlist Floating Button */}
            <button
              onClick={() => toggleWishlist(product._id, product.name)}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                inWishlist
                  ? 'bg-white text-rose-600 scale-105'
                  : 'bg-white/85 text-[#54483C] hover:text-rose-600'
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Right: Product Information & Purchase Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Material Tag */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B38838]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{product.material || 'Kitchenware'}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl text-[#1F1D1B] font-bold mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Price & Savings */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-bold text-[#1F1D1B]">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#9E8E81] line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs bg-[#F7EBD4] text-[#856525] font-semibold px-2 py-0.5 rounded">
                    Save ৳{(product.price - product.discountPrice!).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-[#615346] leading-relaxed font-light border-y border-[#EFE8DF] py-4 space-y-3">
            {descriptionSections ? (
              [
                { title: 'Overview', text: descriptionSections[1] },
                { title: 'Materials', text: descriptionSections[2] },
                { title: 'Product Features', text: descriptionSections[3] }
              ].filter(section => section.text.trim())
                .map(section => (
                  <section key={section.title}>
                    <h3 className="font-semibold text-[#1F1D1B] mb-1">{section.title}</h3>
                    <p className="whitespace-pre-line">{section.text}</p>
                  </section>
                ))
            ) : (
              <p className="whitespace-pre-line">{product.description}</p>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#1F1D1B] uppercase tracking-wider">
                  Color: <span className="font-bold text-[#B38838]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedColor === color
                        ? 'border-[#B38838] bg-[#F7F1E4] text-[#7A5B20] shadow-xs'
                        : 'border-[#E8DFD8] bg-white text-[#5C5044] hover:border-[#D8C7B5]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#1F1D1B] uppercase tracking-wider">
                  Option: <span className="font-bold text-[#B38838]">{selectedSize}</span>
                </span>
                <span className="text-[11px] text-[#9E8E81]">Available options</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedSize === size
                        ? 'border-[#B38838] bg-[#F7F1E4] text-[#7A5B20] shadow-xs'
                        : 'border-[#E8DFD8] bg-white text-[#5C5044] hover:border-[#D8C7B5]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#1F1D1B] uppercase tracking-wider">
                Quantity
              </span>
              <span
                className={`text-xs font-medium ${
                  product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D8C7B5] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-[#4A4036] hover:bg-[#F5EFEB] transition-colors font-medium text-sm"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[#1F1D1B]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(5, product.stock, quantity + 1))}
                  className="px-3.5 py-2 text-[#4A4036] hover:bg-[#F5EFEB] transition-colors font-medium text-sm"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-[#8C7C6E]">
                Total: <strong className="text-[#1F1D1B]">৳{(currentPrice * quantity).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Order Now */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="py-3.5 px-5 bg-[#FAF8F5] border-2 border-[#1F1D1B] text-[#1F1D1B] hover:bg-[#1F1D1B] hover:text-[#FAF8F5] text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleOrderNow}
                disabled={product.stock === 0}
                className="py-3.5 px-5 bg-[#1F1D1B] hover:bg-[#3D352D] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 text-[#C5A059]" />
                <span>Order Now</span>
              </button>
            </div>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="w-full py-2 text-xs text-[#786A5E] hover:text-[#1F1D1B] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share this product</span>
            </button>
          </div>

          {/* Service Guarantee Badges */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] grid grid-cols-3 gap-2 text-center text-[11px] text-[#5C5044]">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#B38838]" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#B38838]" />
              <span>Kitchen Essentials</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-[#B38838]" />
              <span>7-Day Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- PRODUCT INFORMATION TABS ----------------- */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E8DFD8] p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex border-b border-[#E8DFD8] gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-semibold transition-all relative flex-shrink-0 ${
              activeTab === 'details'
                ? 'text-[#1F1D1B]'
                : 'text-[#8C7C6E] hover:text-[#1F1D1B]'
            }`}
          >
            Product Information
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B38838]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sizing')}
            className={`pb-2.5 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-semibold transition-all relative flex-shrink-0 ${
              activeTab === 'sizing'
                ? 'text-[#1F1D1B]'
                : 'text-[#8C7C6E] hover:text-[#1F1D1B]'
            }`}
          >
            Options & Capacity
            {activeTab === 'sizing' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B38838]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-2.5 text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-semibold transition-all relative flex-shrink-0 ${
              activeTab === 'shipping'
                ? 'text-[#1F1D1B]'
                : 'text-[#8C7C6E] hover:text-[#1F1D1B]'
            }`}
          >
            Delivery & COD
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B38838]" />
            )}
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#5C5044] leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
                Product Specifications
              </h4>
              <p>
                <strong>Material:</strong> {product.material}
              </p>
              <p>
                <strong>Available Colors:</strong> {product.colors?.join(', ')}
              </p>
              <p>
                <strong>Available Options:</strong> {product.sizes?.join(', ')}
              </p>
              <p>
                <strong>Care Instructions:</strong> Follow the care instructions supplied with the product.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
                Product Details
              </h4>
              <p>
                Review the product description and photos for details about the cookware or appliance included.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Sizing */}
        {activeTab === 'sizing' && (
          <div className="space-y-4 text-xs text-[#5C5044] leading-relaxed">
            <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
              Available Options & Capacities
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DFD8] text-[#1F1D1B] font-semibold">
                    <th className="py-2">Option</th>
                    <th className="py-2">Product</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB]">
                  {product.sizes?.map(option => (
                    <tr key={option}>
                      <td className="py-2 font-medium text-[#1F1D1B]">{option}</td>
                      <td className="py-2">{product.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#5C5044] leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
                Delivery Coverage
              </h4>
              <p>
                <strong>Inside Dhaka:</strong> 24–48 hours (৳70 delivery charge)
              </p>
              <p>
                <strong>Outside Dhaka:</strong> 48–72 hours across all 64 districts (৳130 delivery charge)
              </p>
              <p>
                <strong>Orders over ৳5000:</strong> Free delivery anywhere in Bangladesh!
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-[#1F1D1B]">
                Cash on Delivery Policy
              </h4>
              <p>
                Pay cash to the delivery rider once your parcel arrives. Check your order details before confirming your purchase.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- YOU MAY ALSO LIKE SECTION ----------------- */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="border-b border-[#E8DFD8] pb-3">
            <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.2em] text-[#B38838]">
              Curated Recommendations
            </span>
            <h3 className="text-lg sm:text-2xl font-bold text-[#1F1D1B] mt-0.5">
              You May Also Like
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8DFD8] p-3 z-40 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#8C7C6E] uppercase tracking-wider font-medium">Total</span>
          <span className="text-base font-bold text-[#1F1D1B] truncate">
            ৳{(currentPrice * quantity).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2.5 bg-[#FAF8F5] border border-[#1F1D1B] text-[#1F1D1B] rounded-xl active:bg-[#1F1D1B] active:text-white transition-colors disabled:opacity-50"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          <button
            onClick={handleOrderNow}
            disabled={product.stock === 0}
            className="flex-1 py-2.5 px-4 bg-[#1F1D1B] active:bg-[#3D352D] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
