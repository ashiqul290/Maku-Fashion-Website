import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { Category, Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  onClearCategory: () => void;
  isLoading: boolean;
  onViewProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategoryId,
  onClearCategory,
  isLoading,
  onViewProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popularity'>('newest');
  const [onlySale, setOnlySale] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const selectedCategory = categories.find(category => category._id === selectedCategoryId);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategoryId) {
      list = list.filter(product => product.categoryId === selectedCategoryId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q))
      );
    }

    if (onlySale) {
      list = list.filter(p => p.sale);
    }

    if (onlyInStock) {
      list = list.filter(p => p.stock > 0);
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [products, searchTerm, sortBy, onlySale, onlyInStock, selectedCategoryId]);

  const hasActiveFilters = searchTerm !== '' || onlySale || onlyInStock || sortBy !== 'newest' || !!selectedCategoryId;

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setOnlySale(false);
    setOnlyInStock(false);
    onClearCategory();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-20 sm:pb-12">
      {/* Filter and Control Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8DFD8] shadow-xs space-y-3 sm:space-y-4">
        {selectedCategory && (
          <h1 className="text-xl font-bold text-[#1F1D1B]">{selectedCategory.name}</h1>
        )}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9E8E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search cookware, pressure cookers, blenders..."
              className="w-full pl-10 pr-9 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs sm:text-sm text-[#1F1D1B] placeholder-[#9E8E81] focus:outline-none focus:border-[#B38838]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8E81] hover:text-[#1F1D1B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Filter Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap">
            {/* Sale filter toggle */}
            <button
              onClick={() => setOnlySale(!onlySale)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
                onlySale
                  ? 'bg-[#B38838] border-[#B38838] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E8DFD8] text-[#5C5044] hover:border-[#D8C7B5]'
              }`}
            >
              On Sale
            </button>

            {/* In Stock toggle */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
                onlyInStock
                  ? 'bg-[#1F1D1B] border-[#1F1D1B] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E8DFD8] text-[#5C5044] hover:border-[#D8C7B5]'
              }`}
            >
              In Stock Only
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl px-2.5 py-1.5 flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9E8E81]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-[#4A4036] focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest">Newest</option>
                <option value="popularity">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Reset button if active */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#9E7528] hover:text-[#B38838] underline px-2 py-1 font-medium flex-shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Counter and status line */}
        <div className="flex items-center justify-between text-xs text-[#786A5E] pt-1 border-t border-[#F5EFEB]">
          <span>
            Showing <strong className="text-[#1F1D1B]">{filteredProducts.length}</strong> products
          </span>
          <span className="text-[11px] text-[#A8988A] hidden sm:inline">
            All categories combined in a single seamless catalog
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8DFD8] p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFD8] flex items-center justify-center mx-auto text-[#9E8E81]">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1F1D1B]">No products found</h3>
            <p className="text-xs text-[#786A5E] mt-1 max-w-sm mx-auto">
              We couldn't find any products matching your search or filters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-[#1F1D1B] text-[#FAF8F5] text-xs uppercase tracking-widest rounded-xl hover:bg-[#3D3732] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
