import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Loader2,
    RefreshCw,
    ShoppingBag,
    UtensilsCrossed,
} from "lucide-react";
import useOrderHistoryViewModel from "../../viewModel/orderHistoryViewModel";
import { TRANSACTION_STATUS, BOOKING_STATUS } from "../../utils/constant";
import VegIndicator from "./components/VegIndicator";

/**
 * ══════════════════════════════════════════════════════════════
 * ORDER HISTORY PAGE (v2 — Swiggy/Zomato-grade)
 * ══════════════════════════════════════════════════════════════
 *
 * Features:
 *   - Payment retry for PENDING and FAILED payments
 *   - Order status tracking (Pending → Preparing → Completed)
 *   - Payment failed banner with retry CTA
 *   - Discount savings display
 *   - Manual refresh button
 *   - Auto-refresh for active orders
 *   - Empty state with "Order Food" CTA
 */

// ── Order status config ──
const ORDER_STATUS_CONFIG = {
    [BOOKING_STATUS.PENDING]: {
        label: 'Order Placed',
        className: 'bg-yellow-500/10 text-yellow-400',
        icon: ShoppingBag,
    },
    [BOOKING_STATUS.IN_PROGRESS]: {
        label: 'Preparing',
        className: 'bg-blue-500/10 text-blue-400',
        icon: UtensilsCrossed,
    },
    [BOOKING_STATUS.COMPLETED]: {
        label: 'Delivered',
        className: 'bg-green-500/10 text-green-400',
        icon: CheckCircle2,
    },
    [BOOKING_STATUS.CANCEL]: {
        label: 'Cancelled',
        className: 'bg-red-500/10 text-red-400',
        icon: AlertTriangle,
    },
};

// ── Payment status config ──
const PAYMENT_STATUS_CONFIG = {
    [TRANSACTION_STATUS.PENDING]: {
        label: 'Pending',
        className: 'border-yellow-500/60 text-yellow-400',
    },
    [TRANSACTION_STATUS.SUCCESS]: {
        label: 'Paid',
        className: 'border-green-500/60 text-green-400',
    },
    [TRANSACTION_STATUS.FAILED]: {
        label: 'Failed',
        className: 'border-red-500/60 text-red-400',
    },
    [TRANSACTION_STATUS.CANCELLED]: {
        label: 'Cancelled',
        className: 'border-[#6B6B6B]/60 text-[#6B6B6B]',
    },
    [TRANSACTION_STATUS.REFUNDED]: {
        label: 'Refunded',
        className: 'border-blue-500/60 text-blue-400',
    },
};

export default function OrderHistory() {
    const {
        orders,
        isLoading,
        isRefreshing,
        error,
        roomNumber,
        payingOrderId,
        canPayOnline,
        handlePayOnline,
        handleRefresh,
        handleBack,
        handleOrderFood,
    } = useOrderHistoryViewModel();

    // Count orders needing payment attention
    const pendingPayments = orders.filter(
        (o) => canPayOnline(o)
    );

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-10">
            <div className="px-5 pt-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 flex items-center justify-center -ml-2"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    {/* Refresh Button */}
                    {!isLoading && orders.length > 0 && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="w-10 h-10 flex items-center justify-center text-[#A7A7A7] active:text-yellow-400 transition-colors"
                        >
                            <RefreshCw
                                size={22}
                                className={isRefreshing ? 'animate-spin text-yellow-400' : ''}
                            />
                        </button>
                    )}
                </div>

                <div className="mt-4">
                    <h1 className="text-[40px] font-semibold leading-none">Order History</h1>
                    <p className="text-[#A7A7A7] text-[22px] mt-3">
                        Room No. {roomNumber || '101'}
                    </p>
                </div>

                {/* ── Payment Pending/Failed Banner ── */}
                {!isLoading && pendingPayments.length > 0 && (
                    <div className="mt-6 rounded-[14px] bg-yellow-400/8 border border-yellow-500/20 px-4 py-3 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-400 mt-[2px] shrink-0" />
                        <div>
                            <p className="text-yellow-400 text-[15px] font-semibold">
                                {pendingPayments.length === 1
                                    ? 'Payment pending for your order'
                                    : `Payment pending for ${pendingPayments.length} orders`
                                }
                            </p>
                            <p className="text-[#8D8D8D] text-[13px] mt-1">
                                Complete the payment or it will remain as Cash on Delivery
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <Loader2 size={40} className="text-yellow-400 animate-spin" />
                        <p className="text-[#A7A7A7] text-[18px]">Loading orders…</p>
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="mt-16 text-center">
                        <p className="text-red-400 text-[18px]">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-4 text-yellow-400 text-[16px] font-medium"
                        >
                            Tap to retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && orders.length === 0 && (
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                            <UtensilsCrossed size={36} className="text-[#4A4A4A]" />
                        </div>
                        <p className="text-[#A7A7A7] text-[18px]">No orders yet</p>
                        <button
                            onClick={handleOrderFood}
                            className="mt-2 h-[48px] px-8 rounded-[14px] bg-yellow-400 text-black text-[17px] font-semibold"
                        >
                            Order Food
                        </button>
                    </div>
                )}

                {/* Orders List */}
                {!isLoading && orders.length > 0 && (
                    <div className="mt-6 flex flex-col gap-5">
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                isPaying={payingOrderId === order._id}
                                showPayButton={canPayOnline(order)}
                                onPayOnline={() => handlePayOnline(order)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


// ══════════════════════════════════════════════════════════════
// ORDER CARD
// ══════════════════════════════════════════════════════════════

function OrderCard({ order, isPaying, showPayButton, onPayOnline }) {
    const isPaymentFailed = order.paymentStatus === TRANSACTION_STATUS.FAILED;
    const hasSavings = order.totalPriceAfterDisCount < order.totalPrice;

    const createdAt = new Date(order.createdAt);
    const dateStr = createdAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timeStr = createdAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return (
        <div className="rounded-[16px] border border-[#3A3A3A] bg-[#1A1A1A] overflow-hidden">
            {/* Payment failed banner inside card */}
            {isPaymentFailed && showPayButton && (
                <div className="bg-red-500/10 px-5 py-2 flex items-center gap-2 border-b border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400" />
                    <p className="text-red-400 text-[13px] font-medium">
                        Payment failed — tap below to retry
                    </p>
                </div>
            )}

            <div className="px-5 pt-5 pb-4">
                {/* Order Status */}
                <OrderStatusBadge status={order.status} />

                {/* Food Items */}
                <div className="mt-3">
                    {order.foodItems?.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="mt-[3px]">
                                    <VegIndicator type={item.foodDetail?.type} size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[18px] text-white font-medium truncate">
                                        {item.foodDetail?.name || 'Food Item'}
                                    </p>
                                    <p className="text-[#A7A7A7] text-[14px] mt-[2px]">
                                        {item.quantity} x ₹{item.price}
                                    </p>
                                </div>
                            </div>
                            <p className="text-white text-[18px] font-semibold ml-4 whitespace-nowrap">
                                ₹{item.quantity * item.price}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bill Details */}
                <div className="mt-2 pt-4 border-t border-dashed border-[#3A3A3A]">
                    <p className="text-white text-[16px] font-bold mb-3">Bill Details</p>

                    <div className="flex justify-between py-[6px]">
                        <p className="text-[#A7A7A7] text-[15px]">Item Total</p>
                        <p className="text-white text-[15px]">₹{order.totalPrice}</p>
                    </div>

                    {/* Discount row (only if discount was applied) */}
                    {hasSavings && (
                        <div className="flex justify-between py-[6px]">
                            <p className="text-green-400 text-[15px]">Discount</p>
                            <p className="text-green-400 text-[15px]">
                                - ₹{(order.totalPrice - order.totalPriceAfterDisCount).toFixed(2)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between py-[6px]">
                        <p className="text-[#A7A7A7] text-[15px]">Taxes & Charges ({order.tax}%)</p>
                        <p className="text-white text-[15px]">₹{order.taxInAmount?.toFixed(2)}</p>
                    </div>

                    <div className="h-px bg-[#3A3A3A] my-2" />

                    <div className="flex justify-between py-[6px]">
                        <p className="text-white text-[16px] font-bold">To Pay</p>
                        <p className="text-white text-[16px] font-bold">₹{order.totalPriceAfterTax}</p>
                    </div>
                </div>

                {/* Pay Online / Retry Payment Button */}
                {showPayButton && (
                    <button
                        onClick={onPayOnline}
                        disabled={isPaying}
                        className="mt-4 w-full h-[52px] rounded-[14px] bg-gradient-to-r from-[#C99F2B] to-[#E2B124] text-black text-[17px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
                    >
                        {isPaying ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing…
                            </>
                        ) : isPaymentFailed ? (
                            <>
                                <CreditCard size={18} />
                                Retry Payment — ₹{order.totalPriceAfterTax}
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} />
                                Pay Online — ₹{order.totalPriceAfterTax}
                            </>
                        )}
                    </button>
                )}

                {/* Date + Payment Status */}
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-[#6B6B6B] text-[13px]">
                        {dateStr} | {timeStr}
                    </p>
                    <PaymentStatusBadge status={order.paymentStatus} />
                </div>
            </div>
        </div>
    );
}


// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function OrderStatusBadge({ status }) {
    const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[BOOKING_STATUS.PENDING];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-[6px] px-3 py-[5px] rounded-full text-[13px] font-semibold ${config.className}`}>
            <Icon size={14} />
            {config.label}
        </div>
    );
}

function PaymentStatusBadge({ status }) {
    const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG[TRANSACTION_STATUS.PENDING];

    return (
        <span className={`text-[13px] font-medium border rounded-full px-3 py-[3px] ${config.className}`}>
            {config.label}
        </span>
    );
}
