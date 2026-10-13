import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomePageProps {
  products: Product[];
  isLoading: boolean;
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  isLoading,
  onNavigate,
  onViewProduct
}) => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  return (
    <div className="space-y-10 sm:space-y-20 pb-12 sm:pb-16">
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative overflow-hidden bg-[#FAF6F0] border-b border-[#EFE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Content Area */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1E7DA] text-[#856525] border border-[#E4D1B8] text-[10px] sm:text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-[#B38838]" />
                <span>Premium Cookware Collection</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl text-[#1F1D1B] font-bold tracking-tight leading-[1.2]">
                Elevate Your Everyday Cooking
              </h1>

              <p className="text-sm sm:text-base text-[#615346] leading-relaxed max-w-xl font-light">
                Discover premium cookware designed for modern kitchens. Durable materials, elegant designs, and reliable performance make every cooking experience easier and more enjoyable.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-7 py-3 bg-[#1F1D1B] active:bg-[#38322C] text-[#FAF8F5] text-xs font-semibold tracking-widest uppercase rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Shop Cookware</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-[#F2ECE4] text-[#1F1D1B] border border-[#D8C7B5] text-xs font-semibold tracking-widest uppercase rounded-xl shadow-xs transition-all duration-300 text-center justify-center"
                >
                  Explore Collection
                </button>
              </div>

            </div>

            {/* Right Hero Image Area */}
            <div className="lg:col-span-6 relative mt-4 lg:mt-0">
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-tr from-[#E6D4B5] to-[#FAF8F5] rounded-3xl opacity-70 blur-xs -rotate-1" />
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#FFFFFF] aspect-[3/2] bg-[#EFE8DF]">
                  <img
                    src="/arabian-saaj-hero.png"
                    alt="Premium cookware collection"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  />

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- BRAND PROMISE PILLARS ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8DF] shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F7F1E4] flex items-center justify-center text-[#B38838] flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1F1D1B]">
                Ethical & Truly Modest
              </h3>
              <p className="text-xs text-[#786A5E] mt-0.5 leading-relaxed">
                Tailored with dignified silhouettes, non-clinging cuts, and opaque premium fabrics respecting authentic modesty.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8DF] shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F7F1E4] flex items-center justify-center text-[#B38838] flex-shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1F1D1B]">
                Cash on Delivery Nationwide
              </h3>
              <p className="text-xs text-[#786A5E] mt-0.5 leading-relaxed">
                Enjoy hassle-free Cash on Delivery across all 64 districts in Bangladesh with rapid 24-48h Dhaka dispatch.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#EFE8DF] shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F7F1E4] flex items-center justify-center text-[#B38838] flex-shrink-0">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1F1D1B]">
                Hassle-Free Size Exchange
              </h3>
              <p className="text-xs text-[#786A5E] mt-0.5 leading-relaxed">
                Need a different abaya length or hijab tone? Our dedicated concierge ensures a swift 7-day exchange process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FEATURED PRODUCTS SECTION ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#B38838]">
              Handcrafted Selection
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-[#1F1D1B] mt-0.5">
              Featured Products
            </h2>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1F1D1B] hover:text-[#B38838] transition-colors border-b border-[#1F1D1B] hover:border-[#B38838] pb-0.5 flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#EFE8DF] overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-[#F5EFEB]" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 bg-[#EFE8DF] rounded w-1/3" />
                  <div className="h-4 bg-[#EFE8DF] rounded w-3/4" />
                  <div className="h-4 bg-[#EFE8DF] rounded w-1/2 pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EFE8DF] p-8">
            <p className="text-lg text-[#1F1D1B]">No products currently displayed</p>
            <p className="text-xs text-[#8C7C6E] mt-1">Please check back soon or visit our shop page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {displayProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* ----------------- COLLECTION SHOWCASE ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D8C7B5] shadow-xl text-[#FAF8F5]">
          <img
            src="/uploads/cookware-09-natural-tri-ply.jpg"
            alt="Stainless steel cookware collection"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F1D1B]/80 via-[#1F1D1B]/55 to-[#1F1D1B]/5" />

          <div className="relative z-10 flex min-h-[440px] items-center px-5 py-10 sm:min-h-[500px] sm:px-12 sm:py-14 lg:min-h-[540px] lg:px-16">
            <div className="max-w-2xl space-y-4">
              <span className="text-[#E4BD72] text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold">
                Maku Collection
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-md">
                Cookware for Every Kitchen
              </h2>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium max-w-xl drop-shadow">
                Discover cookware and kitchen essentials chosen for dependable everyday cooking.
                From durable stainless-steel pots to versatile non-stick sets, find the right pieces for your home.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#C59A43] hover:bg-[#D8B574] text-[#1C1A18] text-xs uppercase font-bold tracking-widest rounded-xl transition-colors text-center shadow-md"
                >
                  Browse All Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS / SISTERHOOD ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#B38838]">
            Customer Love
          </span>
          <h2 className="text-xl sm:text-3xl font-bold text-[#1F1D1B]">
            Loved by Modest Women
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#EFE8DF] space-y-2.5">
            <div className="flex text-[#B38838] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#B38838]" />
              ))}
            </div>
            <p className="text-xs text-[#5C5044] leading-relaxed italic">
              “The Medina Silk hijab in Desert Rose is truly breathtaking. The drape is effortless, doesn't slip, and feels so lightweight under Dhaka humidity.”
            </p>
            <div className="pt-2 border-t border-[#F5EFEB]">
              <p className="text-xs sm:text-sm font-bold text-[#1F1D1B]">Sumaiya Rahman</p>
              <p className="text-[10px] sm:text-[11px] text-[#8C7C6E]">Uttara, Dhaka</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#EFE8DF] space-y-2.5">
            <div className="flex text-[#B38838] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#B38838]" />
              ))}
            </div>
            <p className="text-xs text-[#5C5044] leading-relaxed italic">
              “Ordered the Royal Silk Crepe Abaya. The length (54) was spot-on, and the subtle gold zari embroidery looks so majestic for family gatherings!”
            </p>
            <div className="pt-2 border-t border-[#F5EFEB]">
              <p className="text-xs sm:text-sm font-bold text-[#1F1D1B]">Nusrat Jahan</p>
              <p className="text-[10px] sm:text-[11px] text-[#8C7C6E]">Chittagong</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#EFE8DF] space-y-2.5">
            <div className="flex text-[#B38838] gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#B38838]" />
              ))}
            </div>
            <p className="text-xs text-[#5C5044] leading-relaxed italic">
              “The triple-layered chiffon niqab is wonderfully breathable. Cash on delivery was swift within 24 hours. Arabian Saaj is now my trusted modest brand.”
            </p>
            <div className="pt-2 border-t border-[#F5EFEB]">
              <p className="text-xs sm:text-sm font-bold text-[#1F1D1B]">Khadija Akter</p>
              <p className="text-[10px] sm:text-[11px] text-[#8C7C6E]">Sylhet</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
