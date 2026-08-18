import AppImage from '../../../globalComponents/AppImage';

/**
 * One product tile on the storefront grid.
 * Tapping anywhere opens the detail page; the "+" adds straight to the basket.
 */
export default function ProductCard({ product, onOpen, onAdd, inCart }) {
    const out = (product.stockQty ?? 0) <= 0;
    const off =
        product.mrp && product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : null;

    return (
        <div
            onClick={() => onOpen(product)}
            className="bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-200"
        >
            <div className="relative aspect-square bg-[#111111]">
                <AppImage
                    src={product.images?.[0]}
                    alt={product.name}
                    className={`w-full h-full object-cover ${out ? 'opacity-40' : ''}`}
                    loading="lazy"
                />
                {off !== null && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-green-600 text-white text-[0.65rem] font-bold">
                        {off}% OFF
                    </span>
                )}
                {out && (
                    <span className="absolute inset-x-0 bottom-0 bg-black/70 text-center text-[0.7rem] text-gray-300 py-1">
                        Out of stock
                    </span>
                )}
            </div>

            <div className="p-3">
                <p className="text-sm font-medium leading-tight line-clamp-2 m-0">
                    {product.name}
                </p>

                {product.ratingCount > 0 && (
                    <p className="flex items-center gap-1 text-[0.7rem] text-gray-500 mt-1 m-0">
                        <span className="text-amber-400">★</span>
                        {product.ratingAvg} ({product.ratingCount})
                    </p>
                )}

                <div className="flex items-end justify-between gap-2 mt-2">
                    <div>
                        <span className="text-base font-bold">₹{product.price}</span>
                        {off !== null && (
                            <span className="ml-1.5 text-[0.7rem] text-gray-600 line-through">
                                ₹{product.mrp}
                            </span>
                        )}
                    </div>

                    <button
                        disabled={out}
                        onClick={(e) => {
                            // The tile itself navigates — the quick-add must not.
                            e.stopPropagation();
                            onAdd(product);
                        }}
                        className={`shrink-0 w-8 h-8 rounded-full text-base font-bold flex items-center justify-center border transition-all duration-200 ${
                            out
                                ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                                : inCart
                                  ? 'border-yellow-500 bg-yellow-500 text-black active:scale-90'
                                  : 'border-yellow-500/60 text-yellow-400 bg-transparent active:scale-90'
                        }`}
                        aria-label={`Add ${product.name}`}
                    >
                        {inCart ? inCart : '+'}
                    </button>
                </div>
            </div>
        </div>
    );
}
