import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigateShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigateShop }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryCharge,
    setDeliveryCharge,
    total
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-hidden"
        onClick={closeCart}
        role="presentation"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#1F1D1B]/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 z-10 max-w-full flex w-full justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
            className="w-full sm:max-w-md h-full bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#E8DFD8] min-h-0"
          >
            {/* Header - Compact on mobile */}
            <div className="px-3.5 py-3 sm:px-5 sm:py-4 border-b border-[#E8DFD8] flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#B38838]" />
                <h2 className="font-serif text-sm sm:text-base font-bold text-[#1F1D1B] tracking-wide">
                  Shopping Cart
                </h2>
                <span className="text-[10px] sm:text-xs bg-[#F2E8D5] text-[#7A5B20] px-2 py-0.5 rounded-full font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1 sm:p-1.5 text-[#6B5E51] hover:text-[#1F1D1B] hover:bg-[#F0EAE1] rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Cart Items List - Fully scrollable with flex-1 and min-h-0 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 space-y-2 sm:space-y-3 overscroll-contain">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#EFE8DF] flex items-center justify-center text-[#8C7C6E]">
                    <ShoppingBag className="w-7 h-7 opacity-60" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#1F1D1B]">
                      Your cart is empty
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#8C7C6E] mt-1 max-w-xs leading-relaxed">
                      Find cookware, pressure cookers, rice cookers, and kitchen appliances for your home.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeCart();
                      onNavigateShop();
                    }}
                    className="px-5 py-2 bg-[#1F1D1B] text-[#FAF8F5] text-[11px] uppercase font-medium tracking-widest rounded-lg hover:bg-[#3D3732] transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map(item => {
                  const unitPrice =
                    item.product.discountPrice !== undefined && item.product.discountPrice > 0
                      ? item.product.discountPrice
                      : item.product.price;
                  const itemTotal = unitPrice * item.quantity;
                  const primaryImage =
                    item.product.images?.[0] ||
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div
                      key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
                      className="flex gap-2.5 sm:gap-3 p-2 sm:p-2.5 bg-white rounded-xl border border-[#EFE8DF] shadow-xs"
                    >
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-18 sm:w-16 sm:h-20 object-cover object-center rounded-lg bg-[#F5EFEB] flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs sm:text-sm font-semibold text-[#1F1D1B] line-clamp-1 leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() =>
                                removeFromCart(item.product._id, item.selectedColor, item.selectedSize)
                              }
                              className="text-[#A39282] hover:text-red-500 transition-colors p-1 -mr-1 flex-shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-[#7A6B5E]">
                            <span className="bg-[#FAF8F5] border border-[#E8DFD8] px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">
                              Color: {item.selectedColor}
                            </span>
                            <span className="bg-[#FAF8F5] border border-[#E8DFD8] px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">
                              Size: {item.selectedSize}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5">
                          {/* Compact Quantity selector */}
                          <div className="flex items-center border border-[#D8C7B5] rounded-md overflow-hidden bg-[#FAF8F5]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.selectedColor,
                                  item.selectedSize,
                                  item.quantity - 1
                                )
                              }
                              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-[#EFE8DF] text-[#4A4036] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 sm:w-6 text-center text-[11px] sm:text-xs font-semibold text-[#1F1D1B]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.selectedColor,
                                  item.selectedSize,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= 5}
                              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-[#EFE8DF] text-[#4A4036] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item total */}
                          <div className="text-right">
                            <span className="font-bold text-xs sm:text-sm text-[#0D6E6E]">
                              ৳{itemTotal.toLocaleString()}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-[9px] sm:text-[10px] text-[#8C7C6E]">
                                ৳{unitPrice.toLocaleString()} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout - Compact and responsive */}
            {items.length > 0 && (
              <div className="p-3 sm:p-4 bg-white border-t border-[#E8DFD8] space-y-2 sm:space-y-2.5 flex-shrink-0">
                {/* Shipping Zone Selector */}
                <div className="bg-[#FAF8F5] p-2 sm:p-2.5 rounded-lg border border-[#EFE8DF] text-[11px] sm:text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-[#4A4036]">Delivery Destination:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setDeliveryCharge(70)}
                      className={`py-1.5 px-2 rounded-md border text-center transition-all text-[10px] sm:text-xs ${
                        deliveryCharge === 70
                          ? 'border-[#B38838] bg-[#F7F1E4] text-[#7A5B20] font-semibold shadow-2xs'
                          : 'border-[#E8DFD8] bg-white text-[#6B5E51]'
                      }`}
                    >
                      Inside Dhaka (৳70)
                    </button>
                    <button
                      onClick={() => setDeliveryCharge(130)}
                      className={`py-1.5 px-2 rounded-md border text-center transition-all text-[10px] sm:text-xs ${
                        deliveryCharge === 130
                          ? 'border-[#B38838] bg-[#F7F1E4] text-[#7A5B20] font-semibold shadow-2xs'
                          : 'border-[#E8DFD8] bg-white text-[#6B5E51]'
                      }`}
                    >
                      Outside Dhaka (৳130)
                    </button>
                  </div>
                </div>

                {/* Subtotal / Delivery / Total */}
                <div className="space-y-1 text-[11px] sm:text-xs text-[#5C5044]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1F1D1B]">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-medium text-[#1F1D1B]">৳{deliveryCharge}</span>
                  </div>
                  <div className="pt-1.5 border-t border-[#EFE8DF] flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm font-semibold text-[#1F1D1B]">Total Amount</span>
                    <span className="text-sm sm:text-base font-bold text-[#0D6E6E]">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeCart();
                    onCheckout();
                  }}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#1F1D1B] to-[#3D3732] hover:from-[#3D3732] hover:to-[#1F1D1B] active:scale-[0.99] text-[#FAF8F5] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] rounded-xl shadow-md shadow-[#1F1D1B]/15 flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D9B96E]" />
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D9B96E]" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-[#7A6B5E]">
                  <ShieldCheck className="w-3 h-3 text-[#B38838]" />
                  <span>Cash on Delivery available nationwide</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
