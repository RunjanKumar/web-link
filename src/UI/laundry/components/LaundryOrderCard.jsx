import {
    LAUNDRY_ORDER_STATUS_LABELS,
    LAUNDRY_ORDER_STATUS_STYLES,
    LAUNDRY_ORDER_FLOW,
    LAUNDRY_SERVICE_TYPE_LABELS,
} from '../../../utils/constant';

/**
 * One laundry order: number, status pill, progress track, item lines, total.
 * Cancel only shows while the order is still REQUESTED — the backend refuses
 * once housekeeping has collected it.
 */
export default function LaundryOrderCard({ order, onCancel, cancelling }) {
    const isCancelled = order.status === 'CANCELLED';
    const currentStep = LAUNDRY_ORDER_FLOW.indexOf(order.status);
    const canCancel = order.status === 'REQUESTED';

    return (
        <div className="bg-[#1a1a1a] border border-[rgba(55,55,55,0.6)] rounded-2xl p-4 mb-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold m-0">{order.orderNumber}</p>
                    <p className="text-[0.7rem] text-gray-500 m-0 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                        {order.isExpress && <span className="text-amber-500"> · Express</span>}
                    </p>
                </div>
                <span
                    className={`shrink-0 px-3 py-1 rounded-full text-[0.7rem] font-medium border ${
                        LAUNDRY_ORDER_STATUS_STYLES[order.status] || ''
                    }`}
                >
                    {LAUNDRY_ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
            </div>

            {/* ── Progress track (hidden once cancelled) ── */}
            {!isCancelled && (
                <div className="flex items-center gap-1 mt-4">
                    {LAUNDRY_ORDER_FLOW.map((step, i) => (
                        <div
                            key={step}
                            title={LAUNDRY_ORDER_STATUS_LABELS[step]}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                i <= currentStep ? 'bg-yellow-400' : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* ── Item lines ── */}
            <div className="mt-4 pt-3 border-t border-[rgba(55,55,55,0.6)]">
                {(order.items || []).map((line, i) => (
                    <div key={`${line.itemId}-${i}`} className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span className="capitalize">
                            {line.itemName} × {line.qty}
                            <span className="text-gray-600">
                                {' '}· {LAUNDRY_SERVICE_TYPE_LABELS[line.serviceType] || line.serviceType}
                            </span>
                        </span>
                        <span className="shrink-0 ml-3">₹{Number(line.amount || 0).toFixed(2)}</span>
                    </div>
                ))}

                <div className="flex justify-between text-sm font-semibold mt-3 pt-3 border-t border-[rgba(55,55,55,0.6)]">
                    <span>Total{order.taxPercentage ? ' (incl. tax)' : ''}</span>
                    <span className="text-yellow-400">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                </div>

                {order.status === 'DELIVERED' && order.folio?.transactionId && (
                    <p className="text-[0.7rem] text-green-400/80 m-0 mt-2">Added to your room bill</p>
                )}
            </div>

            {canCancel && (
                <button
                    onClick={() => onCancel(order)}
                    disabled={cancelling}
                    className="w-full mt-4 py-2.5 rounded-full text-xs font-semibold border border-red-500/50 text-red-400 bg-transparent cursor-pointer hover:bg-red-500/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {cancelling ? 'Cancelling…' : 'Cancel Request'}
                </button>
            )}
        </div>
    );
}
