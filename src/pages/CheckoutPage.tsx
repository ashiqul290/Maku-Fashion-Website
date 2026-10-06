import React, { useState } from 'react';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Order } from '../types.ts';
import { BANGLADESH_LOCATIONS } from '../data/bangladeshLocations.ts';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onOrderSuccess
}) => {
  const { items, subtotal, deliveryCharge, setDeliveryCharge, total, clearCart } = useCart();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // 3-Tier Cascading Location Selection
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('Uttara (উত্তরা)');
  const [customArea, setCustomArea] = useState('');

  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Find active location subsets
  const currentDivision =
    BANGLADESH_LOCATIONS.find(d => d.name.toLowerCase() === division.toLowerCase()) ||
    BANGLADESH_LOCATIONS[0];

  const availableDistricts = currentDivision.districts;

  const currentDistrict =
    availableDistricts.find(d => d.name.toLowerCase() === district.toLowerCase()) ||
    availableDistricts[0];

  const availableThanas = currentDistrict ? currentDistrict.thanas : [];

  // Cascading change handlers
  const handleDivisionChange = (newDivisionName: string) => {
    setDivision(newDivisionName);
    const targetDiv =
      BANGLADESH_LOCATIONS.find(d => d.name === newDivisionName) || BANGLADESH_LOCATIONS[0];
    const firstDistrict = targetDiv.districts[0];
    setDistrict(firstDistrict.name);
    setThana(firstDistrict.thanas[0] || '');
    setCustomArea('');

    // Delivery fee auto-sync
    if (firstDistrict.isInsideDhaka) {
      setDeliveryCharge(70);
    } else {
      setDeliveryCharge(130);
    }
  };

  const handleDistrictChange = (newDistrictName: string) => {
    setDistrict(newDistrictName);
    const targetDist =
      availableDistricts.find(d => d.name === newDistrictName) || availableDistricts[0];
    setThana(targetDist?.thanas[0] || '');
    setCustomArea('');

    // Delivery fee auto-sync
    if (targetDist?.isInsideDhaka) {
      setDeliveryCharge(70);
    } else {
      setDeliveryCharge(130);
    }
  };

  const handleThanaChange = (newThanaName: string) => {
    setThana(newThanaName);
    if (!newThanaName.includes('Other')) {
      setCustomArea('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before placing an order.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    // BD phone validation format check
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderProducts = items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
        image: item.product.images?.[0] || ''
      }));

      const finalArea = thana.includes('Other')
        ? (customArea.trim() || 'Other Area')
        : (customArea.trim() ? `${thana} - ${customArea.trim()}` : thana);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          city: division,
          district: district,
          area: finalArea,
          note: note.trim() || undefined,
          products: orderProducts,
          deliveryCharge,
          paymentMethod: 'Cash on Delivery'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      showToast('Order placed successfully!', `Order ID: ${data.order.orderId}`, 'success');
      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'Network error occurred while submitting order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1F1D1B]">Your cart is empty</h2>
        <p className="text-xs text-[#786A5E]">
          Add cookware or a kitchen appliance to your cart before checkout.
        </p>
        <button
          onClick={onBackToCart}
          className="px-6 py-2.5 bg-[#1F1D1B] text-[#FAF8F5] text-xs uppercase tracking-widest rounded-xl hover:bg-[#3D352D]"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-5 sm:space-y-8 pb-20 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-3 sm:pb-4">
        <button
          onClick={onBackToCart}
          className="inline-flex items-center gap-1.5 text-xs uppercase font-medium tracking-wider text-[#786A5E] hover:text-[#1F1D1B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Shop</span>
        </button>
        <h1 className="text-lg sm:text-2xl font-bold text-[#1F1D1B]">
          Express Checkout
        </h1>
        <div className="w-12 sm:w-20" />
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* Left Column: Customer Delivery Form */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-[#E8DFD8] shadow-xs space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1F1D1B] tracking-wide">
              1. Delivery Information
            </h2>
            <p className="text-xs text-[#8C7C6E] mt-0.5">
              Please enter your accurate address for fast door-to-door delivery.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Tasnim Sultana"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
              />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                  Email Address <span className="text-[#9E8E81]">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
                />
              </div>
            </div>

            {/* 3-Tier Cascading Location Selection (City/Region -> District -> Thana/Area) */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* 1. City / Region (বিভাগ) */}
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    City / Region (বিভাগ) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={division}
                    onChange={e => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs sm:text-sm text-[#1F1D1B] font-medium focus:outline-none focus:border-[#B38838]"
                  >
                    {BANGLADESH_LOCATIONS.map(div => (
                      <option key={div.name} value={div.name}>
                        {div.name} ({div.bnName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. District (জেলা) */}
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    District (জেলা) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={e => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs sm:text-sm text-[#1F1D1B] font-medium focus:outline-none focus:border-[#B38838]"
                  >
                    {availableDistricts.map(dist => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name} ({dist.bnName}) {dist.isInsideDhaka ? '• ৳70' : '• ৳130'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Thana / Area (থানা) */}
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    Thana / Area (থানা) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={thana}
                    onChange={e => handleThanaChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs sm:text-sm text-[#1F1D1B] font-medium focus:outline-none focus:border-[#B38838]"
                  >
                    {availableThanas.map(th => (
                      <option key={th} value={th}>
                        {th}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific Sub-Area / Landmark input if 'Other / অন্যান্য' is selected */}
              {thana.includes('Other') && (
                <div>
                  <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    Enter Specific Thana / Area Name (নির্দিষ্ট থানা বা এলাকা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customArea}
                    onChange={e => setCustomArea(e.target.value)}
                    placeholder="e.g. নির্দিষ্ট থানা বা এলাকার নাম লিখুন"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] text-xs sm:text-sm focus:outline-none focus:border-[#B38838]"
                  />
                </div>
              )}

              {/* Delivery charge summary badge */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#F6F1EA] rounded-xl border border-[#E8DFD8] text-[11px] sm:text-xs text-[#5C5044]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#B38838]" />
                  <span>
                    Delivery Charge ({district}):
                  </span>
                </span>
                <span className="font-bold text-[#1F1D1B] bg-white px-2.5 py-0.5 rounded-lg border border-[#E8DFD8]">
                  ৳{deliveryCharge} ({deliveryCharge === 70 ? 'Inside Dhaka City' : 'Outside Dhaka'})
                </span>
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                Full Delivery Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House no, Road no, Sector / Block, Flat no, Landmark..."
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
              />
            </div>

            {/* Delivery Note */}
            <div>
              <label className="block font-medium text-[#1F1D1B] mb-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
                Special Instructions / Delivery Note <span className="text-[#9E8E81]">(Optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Please call before arriving or deliver after 3 PM"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
              />
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="pt-4 border-t border-[#EFE8DF] space-y-3">
            <h3 className="text-sm font-bold text-[#1F1D1B]">
              2. Payment Method
            </h3>
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] rounded-xl border-2 border-[#B38838] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#B38838] text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#1F1D1B]">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#786A5E]">
                    Pay cash to the delivery hero upon receiving your modest parcel.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-[#F1E7DA] text-[#856525] font-semibold px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E8DFD8] shadow-xs space-y-4 sm:space-y-5">
            <h3 className="text-base sm:text-lg font-bold text-[#1F1D1B]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Item list */}
            <div className="divide-y divide-[#F5EFEB] max-h-72 overflow-y-auto pr-1">
              {items.map(item => {
                const unitPrice =
                  item.product.discountPrice !== undefined && item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price;
                const img =
                  item.product.images?.[0] ||
                  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80';

                return (
                  <div
                    key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <img
                      src={img}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-lg bg-[#FAF8F5] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-semibold text-[#1F1D1B] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#8C7C6E]">
                        Qty: {item.quantity} • {item.selectedColor} • {item.selectedSize}
                      </p>
                      <p className="font-semibold text-[#1F1D1B] mt-0.5">
                        ৳{(unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="pt-3.5 border-t border-[#E8DFD8] space-y-2 text-xs text-[#5C5044]">
              <div className="flex justify-between">
                <span>Products Subtotal</span>
                <span className="font-medium text-[#1F1D1B]">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({district})</span>
                <span className="font-medium text-[#1F1D1B]">৳{deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-[#EFE8DF] flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#1F1D1B]">Grand Total</span>
                <span className="text-xl font-bold text-[#1F1D1B]">
                  ৳{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 bg-[#1F1D1B] active:bg-[#38322C] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order (Cash on Delivery)</span>
                  <Truck className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>

            {/* Assurance */}
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[#8C7C6E] text-center pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B38838]" />
              <span>Zero upfront payment required. Pay when you inspect.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
