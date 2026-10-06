import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.material && p.material.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1F1D1B]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative mx-auto max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8DFD8] overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8DFD8] bg-white">
          <Search className="w-5 h-5 text-[#9E8E81] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search cookware, pressure cookers, blenders..."
            className="w-full bg-transparent text-[#1F1D1B] placeholder-[#9E8E81] text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B5E51] hover:text-[#1F1D1B] rounded-full hover:bg-[#F0EAE1]"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4">
          {searchTerm.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#8C7C6E]">
              <p className="font-serif text-sm text-[#1F1D1B] mb-1">
                Looking for something specific?
              </p>
              <p>Search cookware sets, pressure cookers, rice cookers, or mixer grinders.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {['Tri-Ply', 'Non-Stick', 'Pressure Cooker', 'Rice Cooker', 'Mixer Grinder'].map(term => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="px-3 py-1 bg-white border border-[#E8DFD8] rounded-full hover:border-[#B38838] hover:text-[#B38838] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C7C6E]">
              <p className="font-serif text-sm text-[#1F1D1B] mb-1">No products found</p>
              <p>Try searching for "cookware", "pressure cooker", or "mixer grinder".</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] font-medium tracking-wider uppercase text-[#8C7C6E] px-1">
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>
              {filteredProducts.map(product => {
                const image =
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80';
                const price = product.discountPrice || product.price;

                return (
                  <div
                    key={product._id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 p-2.5 bg-white hover:bg-[#F5EFEB] rounded-xl border border-[#EFE8DF] cursor-pointer transition-all group"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-16 object-cover rounded-lg bg-[#FAF8F5]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-[#1F1D1B] truncate group-hover:text-[#B38838] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#8C7C6E] truncate mt-0.5">
                        {product.material}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-serif font-bold text-xs text-[#1F1D1B]">
                          ৳{price.toLocaleString()}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-[#9E8E81] line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C7C6E] group-hover:text-[#B38838] group-hover:translate-x-1 transition-all mr-1" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
