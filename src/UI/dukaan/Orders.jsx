import { useNavigate } from 'react-router-dom';
import BackButton from '../../globalComponents/BackButton';
import AppImage from '../../globalComponents/AppImage';
import RateProductSheet from './components/RateProductSheet';
import { useDukaanOrdersViewModel } from '../../viewModel/dukaanOrdersViewModel';
import {
    DUKAAN_ORDER_STATUS_LABELS,
    DUKAAN_ORDER_STATUS_STYLES,
    DUKAAN_ORDER_FLOW,
    DUKAAN_PAYMENT_LABELS,
} from '../../utils/constant';

const when = (iso) =>
    iso
        ? new Date(iso).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

/* ══════════════════════════════════════════════════
   ── Dukaan — my orders + tracking ──
   ══════════════════════════════════════════════════ */
export default function Orders() {
    const navigate = useNavigate();
    const vm = useDukaanOrdersViewModel();

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
            <div className="pt-12 px-5 pb-8 flex flex-col flex-1">

                <BackButton />

                <div className="flex items-start justify-between gap-3 mt-1 mb-6">
                    <div>
                        <h1 className="text-[1.75rem] font-bold m-0 leading-tight">My orders</h1>
                        <p className="text-xs text-gray-500 m-0 mt-1">Your shop purchases.</p>
                    </div>
                    <button
                        onClick={() => navigate('/dukaan')}
                        className="shrink-0 mt-1 px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-700 text-gray-300 bg-transparent cursor-pointer hover:border-yellow-500/60 hover:text-yellow-400 active:scale-95 transition-all duration-200"
                    >
                        Shop
                    </button>
                </div>

                {vm.loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading your orders…</p>
                        </div>
                    </div>
                )}

                {!vm.loading && vm.error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-400 text-sm">{vm.error}</p>
                        <button
                            onClick={vm.retry}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!vm.loading && !vm.error && vm.orders.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-500 text-sm m-0">
                            You have not ordered anything yet.
                        </p>
                        <button
                            onClick={() => navigate('/dukaan')}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer active:scale-95 transition-all duration-200"
                        >
                            Browse the shop
                        </button>
                    </div>
                )}

                {!vm.loading && !vm.error && vm.orders.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {vm.orders.map((order) => {
                            const expanded = vm.expandedId === order._id;
                            const cancelled = order.status === 'CANCELLED';
                            const reachedIndex = cancelled
                                ? -1
                                : DUKAAN_ORDER_FLOW.indexOf(order.status);
                            const timeByStatus = {};
                            (order.statusTimeline || []).forEach((e) => {
                                timeByStatus[e.status] = e.at;
                            });

                            return (
                                <div
                                    key={order._id}
                                    className="rounded-2xl bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            vm.setExpandedId(expanded ? null : order._id)
                                        }
                                        className="w-full text-left p-4 bg-transparent border-none cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold m-0">
                                                    {order.orderNumber}
                                                </p>
                                                <p className="text-xs text-gray-500 m-0 mt-0.5">
                                                    {when(order.createdAt)} ·{' '}
                                                    {order.items.length} item
                                                    {order.items.length === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold ${
                                                    DUKAAN_ORDER_STATUS_STYLES[order.status] || ''
                                                }`}
                                            >
                                                {DUKAAN_ORDER_STATUS_LABELS[order.status] ||
                                                    order.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3">
                                            {order.items.slice(0, 4).map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="w-10 h-10 rounded-lg overflow-hidden bg-[#111111] shrink-0"
                                                >
                                                    <AppImage
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <span className="text-xs text-gray-500">
                                                    +{order.items.length - 4}
                                                </span>
                                            )}
                                            <span className="ml-auto text-sm font-bold">
                                                ₹{order.grandTotal}
                                            </span>
                                        </div>

                                        <p className="text-[0.7rem] text-gray-500 m-0 mt-2">
                                            {DUKAAN_PAYMENT_LABELS[order.paymentMode] ||
                                                order.paymentMode}
                                            {order.paymentStatus === 'PENDING' && ' · unpaid'}
                                        </p>
                                    </button>

                                    {expanded && (
                                        <div className="px-4 pb-4 border-t border-[rgba(55,55,55,0.6)] pt-4">
                                            {/* ── Items ── */}
                                            <div className="flex flex-col gap-2 mb-4">
                                                {order.items.map((item) => (
                                                    <div
                                                        key={item.productId}
                                                        className="flex items-center justify-between gap-2"
                                                    >
                                                        <span className="text-sm text-gray-300 min-w-0 truncate">
                                                            {item.qty} × {item.name}
                                                        </span>
                                                        <span className="text-sm shrink-0">
                                                            ₹{item.lineTotal}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-[rgba(55,55,55,0.6)]">
                                                    <span>Tax</span>
                                                    <span>₹{order.taxAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span>Total</span>
                                                    <span>₹{order.grandTotal}</span>
                                                </div>
                                            </div>

                                            {/* ── Tracking ── */}
                                            {cancelled ? (
                                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 mb-4">
                                                    <p className="text-sm text-red-400 m-0 font-semibold">
                                                        Cancelled
                                                    </p>
                                                    {order.cancelReason && (
                                                        <p className="text-xs text-gray-400 m-0 mt-1">
                                                            {order.cancelReason}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <ol className="flex flex-col gap-2.5 mb-4 p-0 m-0 list-none">
                                                    {DUKAAN_ORDER_FLOW.map((step, i) => {
                                                        const done = i <= reachedIndex;
                                                        return (
                                                            <li
                                                                key={step}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <span
                                                                    className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[0.6rem] ${
                                                                        done
                                                                            ? 'border-green-500 bg-green-500 text-black'
                                                                            : 'border-gray-700 text-gray-600'
                                                                    }`}
                                                                >
                                                                    {done ? '✓' : i + 1}
                                                                </span>
                                                                <span
                                                                    className={`text-sm ${
                                                                        done
                                                                            ? 'text-gray-200'
                                                                            : 'text-gray-600'
                                                                    }`}
                                                                >
                                                                    {DUKAAN_ORDER_STATUS_LABELS[step]}
                                                                </span>
                                                                <span className="ml-auto text-[0.7rem] text-gray-600">
                                                                    {when(timeByStatus[step])}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ol>
                                            )}

                                            {/* ── Actions ── */}
                                            <div className="flex flex-wrap gap-2">
                                                {vm.canPay(order) && (
                                                    <button
                                                        onClick={() => vm.payNow(order)}
                                                        disabled={vm.busyId === order._id}
                                                        className="flex-1 min-w-[8rem] py-2.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-xs border-none cursor-pointer active:scale-95 disabled:opacity-60 transition-transform duration-200"
                                                    >
                                                        Pay ₹{order.grandTotal}
                                                    </button>
                                                )}

                                                {vm.canCancel(order) && (
                                                    <button
                                                        onClick={() =>
                                                            vm.cancel(order, 'Cancelled by guest')
                                                        }
                                                        disabled={vm.busyId === order._id}
                                                        className="flex-1 min-w-[8rem] py-2.5 rounded-full border border-red-500/50 text-red-400 bg-transparent font-semibold text-xs cursor-pointer active:scale-95 disabled:opacity-60 transition-transform duration-200"
                                                    >
                                                        Cancel order
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        vm.reorder(order);
                                                        navigate('/dukaan/cart');
                                                    }}
                                                    className="flex-1 min-w-[8rem] py-2.5 rounded-full border border-gray-700 text-gray-300 bg-transparent font-semibold text-xs cursor-pointer active:scale-95 transition-transform duration-200"
                                                >
                                                    Order again
                                                </button>
                                            </div>

                                            {/* Rating is only offered once the goods have arrived. */}
                                            {order.status === 'DELIVERED' && (
                                                <div className="mt-3 pt-3 border-t border-[rgba(55,55,55,0.6)]">
                                                    <p className="text-xs text-gray-500 m-0 mb-2">
                                                        Rate what you bought
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.items.map((item) => (
                                                            <button
                                                                key={item.productId}
                                                                onClick={() =>
                                                                    vm.setReviewFor({ order, item })
                                                                }
                                                                className="px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 bg-transparent text-xs cursor-pointer hover:border-yellow-500/60 hover:text-yellow-400 transition-all duration-200"
                                                            >
                                                                ★ {item.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <RateProductSheet
                target={vm.reviewFor}
                busy={Boolean(vm.busyId)}
                onClose={() => vm.setReviewFor(null)}
                onSubmit={vm.submitReview}
            />
        </div>
    );
}
