import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import PreCheckInBanner from '../../globalComponents/PreCheckInBanner';
import LaundryItemCard from './components/LaundryItemCard';
import useLaundryViewModel from '../../viewModel/laundryViewModel';

/* ══════════════════════════════════════════════════
   ── Laundry — rate list + pickup request ──
   ══════════════════════════════════════════════════ */
export default function Laundry() {
    const navigate = useNavigate();
    const {
        items,
        loading,
        error,
        refetch,
        basket,
        addItem,
        removeItem,
        setQty,
        setServiceType,
        rateFor,
        isExpress,
        setIsExpress,
        notes,
        setNotes,
        summary,
        submitting,
        submitOrder,
        canOrder,
    } = useLaundryViewModel();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const hasSelection = summary.lines.length > 0;

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className={`pt-12 px-5 flex flex-col flex-1 ${hasSelection ? 'pb-48' : 'pb-6'}`}>

                <BackButton />
                <PreCheckInBanner />

                <div className="flex items-start justify-between gap-3 mt-1 mb-6">
                    <div>
                        <h1 className="text-[1.75rem] font-bold m-0 leading-tight">Laundry</h1>
                        <p className="text-xs text-gray-500 m-0 mt-1">
                            Charges are added to your room bill.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/laundry/orders')}
                        className="shrink-0 mt-1 px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-700 text-gray-300 bg-transparent cursor-pointer hover:border-yellow-500/60 hover:text-yellow-400 active:scale-95 transition-all duration-200"
                    >
                        My Orders
                    </button>
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading rate list…</p>
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Rate list ── */}
                {!loading && !error && (
                    items.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Laundry service is not available right now.</p>
                        </div>
                    ) : (
                        <>
                            {items.map((item) => (
                                <LaundryItemCard
                                    key={item._id}
                                    item={item}
                                    line={basket[item._id]}
                                    rateFor={rateFor}
                                    onAdd={addItem}
                                    onRemove={removeItem}
                                    onQtyChange={setQty}
                                    onServiceChange={setServiceType}
                                />
                            ))}

                            {hasSelection && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => setIsExpress(!isExpress)}
                                        className={`w-full flex items-center justify-between bg-[#1a1a1a] border rounded-2xl p-4 cursor-pointer transition-colors duration-200 ${
                                            isExpress ? 'border-yellow-500/60' : 'border-[rgba(55,55,55,0.6)]'
                                        }`}
                                    >
                                        <span className="text-left">
                                            <span className="block text-sm font-semibold">Express service</span>
                                            <span className="block text-[0.7rem] text-gray-500 mt-0.5">
                                                Ask housekeeping to prioritise this order
                                            </span>
                                        </span>
                                        <span
                                            className={`w-10 h-[22px] rounded-full relative shrink-0 transition-colors duration-300 ${
                                                isExpress ? 'bg-amber-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <span
                                                className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform duration-300 ${
                                                    isExpress ? 'translate-x-[20px]' : 'translate-x-[2px]'
                                                }`}
                                            />
                                        </span>
                                    </button>

                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Instructions for housekeeping (optional)"
                                        className="w-full mt-3 bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-yellow-500/60 transition-colors duration-200 resize-none"
                                    />
                                </div>
                            )}
                        </>
                    )
                )}
            </div>

            {/* ── Sticky summary + submit ── */}
            {hasSelection && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[rgba(55,55,55,0.6)] px-5 pt-4 pb-6 z-50">
                    <div className="max-w-[28rem] mx-auto">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{summary.pieceCount} piece{summary.pieceCount === 1 ? '' : 's'}</span>
                            <span>₹{summary.subTotal.toFixed(2)}</span>
                        </div>
                        {summary.taxPercentage > 0 && (
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Tax ({summary.taxPercentage}%)</span>
                                <span>₹{summary.taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-[rgba(55,55,55,0.6)]">
                            <span>Estimated total</span>
                            <span className="text-yellow-400">₹{summary.totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={submitOrder}
                            disabled={submitting}
                            className={`w-full mt-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 disabled:opacity-60 disabled:cursor-not-allowed ${!canOrder ? 'opacity-50 grayscale' : ''}`}
                        >
                            {submitting
                                ? 'Requesting…'
                                : canOrder
                                  ? 'Request Pickup'
                                  : 'Available after check-in'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
