import { useNavigate } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import AppImage from '../../globalComponents/AppImage';
import CheckoutSheet from './components/CheckoutSheet';
import { useDukaanCartViewModel } from '../../viewModel/dukaanCartViewModel';
import useDukaanCart from '../../hooks/DukaanCart';

/* ══════════════════════════════════════════════════
   ── Dukaan — basket + checkout ──
   ══════════════════════════════════════════════════ */
export default function Cart() {
    const navigate = useNavigate();
    const vm = useDukaanCartViewModel();
    const { setQty, removeFromCart } = useDukaanCart();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
            <div className={`pt-12 px-5 flex flex-col flex-1 ${vm.items.length ? 'pb-40' : 'pb-6'}`}>

                <BackButton />

                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-1 leading-tight">
                    Your basket
                </h1>
                <p className="text-xs text-gray-500 m-0 mb-6">
                    {vm.items.length
                        ? `${vm.totals.count} item${vm.totals.count === 1 ? '' : 's'}`
                        : 'Nothing here yet'}
                </p>

                {vm.items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-500 text-sm m-0">Your basket is empty.</p>
                        <button
                            onClick={() => navigate('/dukaan')}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer active:scale-95 transition-all duration-200"
                        >
                            Browse the shop
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3">
                            {vm.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-3 p-3 rounded-2xl bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)]"
                                >
                                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#111111]">
                                        <AppImage
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium m-0 line-clamp-2 leading-tight">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                                            ₹{item.price} each
                                        </p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-[rgba(55,55,55,0.6)]">
                                                <button
                                                    onClick={() => setQty(item.productId, item.qty - 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-transparent border-none text-base text-yellow-400 cursor-pointer"
                                                    aria-label="Decrease"
                                                >
                                                    −
                                                </button>
                                                <span className="w-5 text-center text-sm">{item.qty}</span>
                                                <button
                                                    onClick={() => setQty(item.productId, item.qty + 1)}
                                                    disabled={item.qty >= item.stockQty}
                                                    className="w-6 h-6 flex items-center justify-center bg-transparent border-none text-base text-yellow-400 disabled:text-gray-700 cursor-pointer"
                                                    aria-label="Increase"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span className="text-sm font-semibold">
                                                ₹{Math.round(item.price * item.qty * 100) / 100}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="shrink-0 self-start text-gray-600 bg-transparent border-none cursor-pointer p-1"
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M18 6 6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ── Bill ── */}
                        <div className="mt-6 p-4 rounded-2xl bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)]">
                            <h2 className="text-sm font-semibold m-0 mb-3">Bill summary</h2>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-gray-400">Items</span>
                                <span>₹{vm.totals.subTotal}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-gray-400">Tax</span>
                                <span>₹{vm.totals.taxAmount}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-[rgba(55,55,55,0.6)]">
                                <span>Total</span>
                                <span>₹{vm.totals.grandTotal}</span>
                            </div>
                            {vm.totals.taxIsEstimate && (
                                <p className="text-[0.7rem] text-gray-500 m-0 mt-2">
                                    Tax on some items follows the hotel rate — your final total is
                                    confirmed when the order is placed.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {vm.items.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent">
                    <button
                        onClick={vm.openCheckout}
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 transition-transform duration-200"
                    >
                        <span>₹{vm.totals.grandTotal}</span>
                        <span>Checkout →</span>
                    </button>
                </div>
            )}

            <CheckoutSheet vm={vm} />
        </div>
    );
}
