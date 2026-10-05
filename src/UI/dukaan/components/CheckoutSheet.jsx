import { DUKAAN_PAYMENT_OPTIONS } from '../../../utils/constant';

/**
 * Checkout bottom sheet: where it goes, how they pay, and Place order.
 *
 * Payment method is the last decision, directly above the button, so the guest
 * confirms the amount and the method in one glance.
 */
export default function CheckoutSheet({ vm }) {
    if (!vm.showCheckout) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70" onClick={vm.closeCheckout} />

            <div className="relative w-full bg-[#1a1a1a] border-t border-[rgba(55,55,55,0.6)] rounded-t-3xl p-5 pb-8 max-h-[88vh] overflow-y-auto animate-[slideDown_0.2s_ease-out]">
                <div className="w-10 h-1 rounded-full bg-gray-700 mx-auto mb-5" />

                <h2 className="text-lg font-bold m-0 mb-5">Checkout</h2>

                {/* ── Where ── */}
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 mb-2">
                    Where should we bring it?
                </p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                        { value: 'ROOM', label: 'To my room' },
                        { value: 'PICKUP', label: 'I’ll collect it' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => vm.setDeliverTo(opt.value)}
                            className={`px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${
                                vm.deliverTo === opt.value
                                    ? 'border-yellow-500/60 bg-yellow-400/10 text-yellow-400'
                                    : 'border-[rgba(55,55,55,0.6)] bg-transparent text-gray-300'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <input
                    value={vm.deliveryNote}
                    onChange={(e) => vm.setDeliveryNote(e.target.value)}
                    placeholder="Any instructions? (optional)"
                    className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-[rgba(55,55,55,0.6)] text-white text-sm outline-none focus:border-yellow-500/60 mb-6"
                />

                {/* ── Offer ── */}
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 mb-2">
                    Have an offer code?
                </p>
                {vm.applied ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-green-500/50 bg-green-500/10 mb-6">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-green-400 m-0 font-mono">
                                {vm.applied.couponName}
                            </p>
                            <p className="text-xs text-gray-400 m-0 mt-0.5">
                                You save ₹{vm.applied.discount}
                            </p>
                        </div>
                        <button
                            onClick={vm.removeCoupon}
                            className="shrink-0 text-xs text-gray-400 bg-transparent border-none cursor-pointer underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 mb-6">
                        <input
                            value={vm.couponInput}
                            onChange={(e) => vm.setCouponInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && vm.applyCoupon()}
                            placeholder="Enter code"
                            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-[#111111] border border-[rgba(55,55,55,0.6)] text-white text-sm uppercase outline-none focus:border-yellow-500/60"
                        />
                        <button
                            onClick={vm.applyCoupon}
                            disabled={vm.checkingCoupon || !vm.couponInput.trim()}
                            className="shrink-0 px-5 rounded-xl border border-yellow-500/60 text-yellow-400 bg-transparent text-sm font-semibold cursor-pointer disabled:opacity-40 active:scale-95 transition-transform duration-200"
                        >
                            {vm.checkingCoupon ? '…' : 'Apply'}
                        </button>
                    </div>
                )}

                {/* ── How ── */}
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 mb-2">
                    How would you like to pay?
                </p>
                <div className="flex flex-col gap-2 mb-6">
                    {DUKAAN_PAYMENT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => vm.setPaymentMode(opt.value)}
                            className={`flex items-start justify-between gap-3 text-left px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                vm.paymentMode === opt.value
                                    ? 'border-yellow-500/60 bg-yellow-400/10'
                                    : 'border-[rgba(55,55,55,0.6)] bg-transparent'
                            }`}
                        >
                            <span className="min-w-0">
                                <span
                                    className={`block text-sm font-semibold ${
                                        vm.paymentMode === opt.value ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                >
                                    {opt.label}
                                </span>
                                <span className="block text-xs text-gray-500 mt-0.5">{opt.hint}</span>
                            </span>
                            <span
                                className={`shrink-0 mt-1 w-4 h-4 rounded-full border-2 ${
                                    vm.paymentMode === opt.value
                                        ? 'border-yellow-500 bg-yellow-500'
                                        : 'border-gray-600'
                                }`}
                            />
                        </button>
                    ))}
                </div>

                {/* ── Total ── */}
                <div className="pt-4 border-t border-[rgba(55,55,55,0.6)] mb-4">
                    {vm.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-400 mb-1">
                            <span>Offer discount</span>
                            <span>−₹{vm.discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-400">Total payable</span>
                        <span className="text-xl font-bold">₹{vm.payable}</span>
                    </div>
                </div>

                <button
                    onClick={vm.placeOrder}
                    disabled={vm.placing}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 disabled:opacity-60 transition-transform duration-200"
                >
                    {vm.placing
                        ? 'Placing your order…'
                        : vm.paymentMode === 'ONLINE'
                          ? `Pay ₹${vm.payable}`
                          : 'Place order'}
                </button>
            </div>
        </div>
    );
}
