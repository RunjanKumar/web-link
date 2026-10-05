import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import LaundryOrderCard from './components/LaundryOrderCard';
import useLaundryOrdersViewModel from '../../viewModel/laundryOrdersViewModel';

/* ══════════════════════════════════════════════════
   ── My Laundry Orders (tracker + history) ──
   ══════════════════════════════════════════════════ */
export default function LaundryOrders() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        activeOrders,
        pastOrders,
        hasAnyOrders,
        loading,
        error,
        refetch,
        cancelOrder,
        cancellingId,
    } = useLaundryOrdersViewModel();

    // Toast once, if we arrived straight from placing an order.
    const showToastInitially = location.state?.showToast || false;

    useEffect(() => {
        if (showToastInitially) {
            toast.success('Your laundry pickup has been requested.');
            window.history.replaceState({}, '');
        }
    }, [showToastInitially]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                <BackButton />

                <h1 className="text-[1.75rem] font-bold m-0 mt-1 mb-6 leading-tight">
                    My Laundry
                </h1>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading orders…</p>
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

                {/* ── Orders ── */}
                {!loading && !error && (
                    <>
                        {activeOrders.length > 0 && (
                            <>
                                <h2 className="text-yellow-400/80 text-sm font-semibold m-0 mb-3">In Progress</h2>
                                {activeOrders.map((order) => (
                                    <LaundryOrderCard
                                        key={order._id}
                                        order={order}
                                        onCancel={cancelOrder}
                                        cancelling={cancellingId === order._id}
                                    />
                                ))}
                            </>
                        )}

                        {pastOrders.length > 0 && (
                            <>
                                <h2 className="text-gray-400 text-sm font-semibold m-0 mt-4 mb-3">Past Orders</h2>
                                {pastOrders.map((order) => (
                                    <LaundryOrderCard
                                        key={order._id}
                                        order={order}
                                        onCancel={cancelOrder}
                                        cancelling={cancellingId === order._id}
                                    />
                                ))}
                            </>
                        )}

                        {!hasAnyOrders && (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-500 text-sm">No laundry orders yet</p>
                            </div>
                        )}
                    </>
                )}

                <div className="flex-1" />

                <button
                    onClick={() => navigate('/laundry')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/20 mt-4"
                >
                    Request Pickup
                </button>
            </div>
        </div>
    );
}
