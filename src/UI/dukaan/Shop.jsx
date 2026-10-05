import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import AppImage from '../../globalComponents/AppImage';
import PreCheckInBanner from '../../globalComponents/PreCheckInBanner';
import ProductCard from './components/ProductCard';
import FilterSheet from './components/FilterSheet';
import { useDukaanViewModel } from '../../viewModel/dukaanViewModel';
import useDukaanCart from '../../hooks/DukaanCart';

/* ══════════════════════════════════════════════════
   ── Dukaan — the in-hotel shop storefront ──
   ══════════════════════════════════════════════════ */
export default function Shop() {
    const navigate = useNavigate();
    const vm = useDukaanViewModel();
    const { addToCart, getQty, totals } = useDukaanCart();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const openProduct = (product) =>
        navigate(`/dukaan/product?id=${product._id}`);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className={`pt-12 px-5 flex flex-col flex-1 ${totals.count > 0 ? 'pb-28' : 'pb-6'}`}>

                <BackButton />
                <PreCheckInBanner />

                <div className="flex items-start justify-between gap-3 mt-1 mb-5">
                    <div>
                        <h1 className="text-[1.75rem] font-bold m-0 leading-tight">Dukaan</h1>
                        <p className="text-xs text-gray-500 m-0 mt-1">
                            Everyday essentials, delivered to your room.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dukaan/orders')}
                        className="shrink-0 mt-1 px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-700 text-gray-300 bg-transparent cursor-pointer hover:border-yellow-500/60 hover:text-yellow-400 active:scale-95 transition-all duration-200"
                    >
                        My Orders
                    </button>
                </div>

                {/* ── Search + filter ── */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            value={vm.search}
                            onChange={(e) => vm.setSearch(e.target.value)}
                            placeholder="Search the shop…"
                            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] text-white text-sm outline-none focus:border-yellow-500/60"
                        />
                    </div>
                    <button
                        onClick={() => setFiltersOpen(true)}
                        className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center bg-transparent cursor-pointer active:scale-95 transition-all duration-200 ${
                            vm.hasActiveFilters
                                ? 'border-yellow-500 text-yellow-400'
                                : 'border-[rgba(55,55,55,0.6)] text-gray-400'
                        }`}
                        aria-label="Sort and filter"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 6h18M6 12h12M10 18h4" />
                        </svg>
                    </button>
                </div>

                {/* ── Category chips ── */}
                {vm.categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-none">
                        <button
                            onClick={() => vm.setCategoryId('')}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 ${
                                !vm.categoryId
                                    ? 'border-yellow-500 bg-yellow-500 text-black'
                                    : 'border-gray-700 text-gray-300 bg-transparent'
                            }`}
                        >
                            All
                        </button>
                        {vm.categories.map((c) => (
                            <button
                                key={c._id}
                                onClick={() => vm.setCategoryId(c._id)}
                                className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 ${
                                    vm.categoryId === c._id
                                        ? 'border-yellow-500 bg-yellow-500 text-black'
                                        : 'border-gray-700 text-gray-300 bg-transparent'
                                }`}
                            >
                                {c.imageUrl && (
                                    <AppImage
                                        src={c.imageUrl}
                                        alt=""
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                )}
                                {c.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Loading ── */}
                {vm.loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Opening the shop…</p>
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {!vm.loading && vm.error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-400 text-sm">{vm.error}</p>
                        <button
                            onClick={vm.retry}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Grid ── */}
                {!vm.loading && !vm.error && (
                    vm.products.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            <p className="text-gray-500 text-sm m-0">
                                {vm.search || vm.hasActiveFilters
                                    ? 'Nothing matches that.'
                                    : 'The shop is empty right now.'}
                            </p>
                            {(vm.search || vm.hasActiveFilters) && (
                                <button
                                    onClick={() => {
                                        vm.setSearch('');
                                        vm.clearFilters();
                                    }}
                                    className="text-xs text-yellow-400 bg-transparent border-none cursor-pointer"
                                >
                                    Clear search and filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                {vm.products.map((p) => (
                                    <ProductCard
                                        key={p._id}
                                        product={p}
                                        inCart={getQty(p._id)}
                                        onOpen={openProduct}
                                        onAdd={addToCart}
                                    />
                                ))}
                            </div>

                            {vm.hasMore && (
                                <button
                                    onClick={vm.loadMore}
                                    disabled={vm.loadingMore}
                                    className="mt-5 mx-auto px-6 py-2 rounded-full text-sm font-semibold border border-gray-700 text-gray-300 bg-transparent cursor-pointer active:scale-95 transition-all duration-200"
                                >
                                    {vm.loadingMore ? 'Loading…' : 'Load more'}
                                </button>
                            )}
                        </>
                    )
                )}
            </div>

            {/* ── Sticky basket bar ── */}
            {totals.count > 0 && (
                <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
                    <button
                        onClick={() => navigate('/dukaan/cart')}
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 transition-transform duration-200"
                    >
                        <span>
                            {totals.count} item{totals.count === 1 ? '' : 's'}
                        </span>
                        <span>View basket · ₹{totals.grandTotal}</span>
                    </button>
                </div>
            )}

            <FilterSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                sort={vm.sort}
                setSort={vm.setSort}
                inStockOnly={vm.inStockOnly}
                setInStockOnly={vm.setInStockOnly}
                minPrice={vm.minPrice}
                setMinPrice={vm.setMinPrice}
                maxPrice={vm.maxPrice}
                setMaxPrice={vm.setMaxPrice}
                hasActiveFilters={vm.hasActiveFilters}
                clearFilters={vm.clearFilters}
            />
        </div>
    );
}
