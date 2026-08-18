import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import AppImage from '../../globalComponents/AppImage';
import ProductCard from './components/ProductCard';
import { useDukaanProductViewModel } from '../../viewModel/dukaanProductViewModel';
import useDukaanCart from '../../hooks/DukaanCart';

/* ══════════════════════════════════════════════════
   ── Dukaan — product detail ──
   ══════════════════════════════════════════════════ */
export default function ProductDetail() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const productId = params.get('id');

    const vm = useDukaanProductViewModel(productId);
    const { addToCart, getQty, totals } = useDukaanCart();

    if (vm.loading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (vm.error || !vm.product) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
                <div className="pt-12 px-5">
                    <BackButton />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
                    <p className="text-gray-400 text-sm text-center">
                        {vm.error || 'This product is no longer available.'}
                    </p>
                    <button
                        onClick={() => navigate('/dukaan')}
                        className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer active:scale-95 transition-all duration-200"
                    >
                        Back to the shop
                    </button>
                </div>
            </div>
        );
    }

    const p = vm.product;
    const off =
        p.mrp && p.mrp > p.price
            ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
            : null;
    const images = p.images?.length ? p.images : [null];
    const inCart = getQty(p._id);

    const add = () => {
        addToCart(p, vm.qty);
        toast.success(`${p.name} added to your basket.`);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col pb-32">
            <div className="pt-12 px-5">
                <BackButton />
            </div>

            {/* ── Gallery ── */}
            <div className="mt-2">
                <div className="relative aspect-square bg-[#1a1a1a] mx-5 rounded-2xl overflow-hidden border border-[rgba(55,55,55,0.6)]">
                    <AppImage
                        src={images[vm.activeImage]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                    />
                    {off !== null && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-green-600 text-white text-xs font-bold">
                            {off}% OFF
                        </span>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto px-5 mt-3 scrollbar-none">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => vm.setActiveImage(i)}
                                className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 bg-[#1a1a1a] cursor-pointer ${
                                    vm.activeImage === i
                                        ? 'border-yellow-500'
                                        : 'border-[rgba(55,55,55,0.6)]'
                                }`}
                            >
                                <AppImage src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Info ── */}
            <div className="px-5 mt-5">
                {p.brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide m-0">{p.brand}</p>
                )}
                <h1 className="text-xl font-bold m-0 mt-1 leading-snug">{p.name}</h1>

                {p.ratingCount > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 m-0">
                        <span className="px-1.5 py-0.5 rounded bg-green-600/20 text-green-400 font-semibold">
                            {p.ratingAvg} ★
                        </span>
                        {p.ratingCount} rating{p.ratingCount === 1 ? '' : 's'}
                    </p>
                )}

                <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-bold">₹{p.price}</span>
                    {off !== null && (
                        <>
                            <span className="text-sm text-gray-600 line-through">₹{p.mrp}</span>
                            <span className="text-sm text-green-500 font-semibold">{off}% off</span>
                        </>
                    )}
                </div>

                {/* Stock urgency is genuine here — the counter is live. */}
                {vm.isOutOfStock ? (
                    <p className="text-sm text-red-400 mt-2 m-0">Out of stock</p>
                ) : vm.maxQty <= 5 ? (
                    <p className="text-sm text-orange-400 mt-2 m-0">
                        Only {vm.maxQty} left
                    </p>
                ) : (
                    <p className="text-sm text-green-500 mt-2 m-0">In stock</p>
                )}

                {p.description && (
                    <p className="text-sm text-gray-400 mt-4 m-0 leading-relaxed">
                        {p.description}
                    </p>
                )}

                {p.longDescription && (
                    <div className="mt-5">
                        <h2 className="text-sm font-semibold m-0 mb-2">Details</h2>
                        <p className="text-sm text-gray-400 m-0 leading-relaxed whitespace-pre-line">
                            {p.longDescription}
                        </p>
                    </div>
                )}

                {/* ── Quantity ── */}
                {!vm.isOutOfStock && (
                    <div className="flex items-center gap-4 mt-6">
                        <span className="text-sm text-gray-400">Quantity</span>
                        <div className="flex items-center gap-3 px-2 py-1 rounded-full border border-[rgba(55,55,55,0.6)]">
                            <button
                                onClick={vm.decrement}
                                disabled={vm.qty <= 1}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-transparent border-none text-lg text-yellow-400 disabled:text-gray-700 cursor-pointer"
                            >
                                −
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{vm.qty}</span>
                            <button
                                onClick={vm.increment}
                                disabled={vm.qty >= vm.maxQty}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-transparent border-none text-lg text-yellow-400 disabled:text-gray-700 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                        {inCart > 0 && (
                            <span className="text-xs text-gray-500">{inCart} in basket</span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Related ── */}
            {vm.related.length > 0 && (
                <div className="mt-8 px-5">
                    <h2 className="text-sm font-semibold m-0 mb-3">You may also like</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {vm.related.map((r) => (
                            <ProductCard
                                key={r._id}
                                product={r}
                                inCart={getQty(r._id)}
                                onOpen={(prod) => navigate(`/dukaan/product?id=${prod._id}`)}
                                onAdd={(prod) => {
                                    addToCart(prod, 1);
                                    toast.success(`${prod.name} added.`);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sticky actions ── */}
            <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent flex gap-3">
                <button
                    onClick={add}
                    disabled={vm.isOutOfStock}
                    className={`flex-1 py-3.5 rounded-full font-bold text-sm border cursor-pointer active:scale-95 transition-transform duration-200 ${
                        vm.isOutOfStock
                            ? 'border-gray-800 text-gray-700 bg-transparent cursor-not-allowed'
                            : 'border-yellow-500/60 text-yellow-400 bg-transparent'
                    }`}
                >
                    {vm.isOutOfStock ? 'Out of stock' : 'Add to basket'}
                </button>
                <button
                    onClick={() => {
                        if (vm.isOutOfStock) return;
                        addToCart(p, vm.qty);
                        navigate('/dukaan/cart');
                    }}
                    disabled={vm.isOutOfStock}
                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 disabled:opacity-40 transition-transform duration-200"
                >
                    Buy now
                </button>
            </div>

            {totals.count > 0 && (
                <button
                    onClick={() => navigate('/dukaan/cart')}
                    className="fixed top-12 right-5 w-10 h-10 rounded-full bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] flex items-center justify-center cursor-pointer"
                    aria-label="Open basket"
                >
                    <span className="text-sm">🛒</span>
                    <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-yellow-500 text-black text-[0.65rem] font-bold flex items-center justify-center">
                        {totals.count}
                    </span>
                </button>
            )}
        </div>
    );
}
