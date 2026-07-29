import { useEffect } from 'react';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import useBillViewModel from '../../viewModel/billViewModel';
import useCustomerProfile from '../../hooks/CustomerProfile';
import { formattedDate } from '../../utils/commonFunction';

const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function SummaryRow({ label, value, strong, credit }) {
    return (
        <div className="flex items-center justify-between py-2">
            <p className={`${strong ? 'text-white font-semibold' : 'text-[#A7A7A7]'} text-[14px] m-0`}>
                {label}
            </p>
            <p className={`${
                strong ? 'text-yellow-400 font-semibold text-base'
                : credit ? 'text-green-400'
                : 'text-white'
            } text-[14px] m-0`}>
                {value}
            </p>
        </div>
    );
}

function ChargeLine({ charge }) {
    const name = charge.chargeName || charge.label || 'Charge';
    const isRefund = charge.label === 'Refund' || Number(charge.total) < 0;
    return (
        <div className="flex items-start justify-between py-3 border-b border-dashed border-[#3A3A3A] last:border-b-0">
            <div className="min-w-0 pr-3">
                <p className="text-white text-sm font-medium m-0 truncate">{name}</p>
                <p className="text-gray-500 text-xs m-0 mt-1">
                    {charge.label}
                    {charge.quantity > 1 ? ` · Qty ${charge.quantity}` : ''}
                    {charge.createdAt ? ` · ${formattedDate(charge.createdAt)}` : ''}
                </p>
            </div>
            <p className={`${isRefund ? 'text-green-400' : 'text-white'} text-sm font-semibold m-0 shrink-0`}>
                {isRefund ? `-${formatMoney(Math.abs(charge.total))}` : formatMoney(charge.total)}
            </p>
        </div>
    );
}

function PaymentLine({ payment }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-dashed border-[#3A3A3A] last:border-b-0">
            <div className="min-w-0 pr-3">
                <p className="text-white text-sm font-medium m-0 truncate">
                    {payment.methodLabel || payment.method || 'Payment'}
                </p>
                <p className="text-gray-500 text-xs m-0 mt-1">
                    {payment.invoiceNumber ? `${payment.invoiceNumber} · ` : ''}
                    {payment.paidAt ? formattedDate(payment.paidAt) : ''}
                </p>
            </div>
            <p className="text-green-400 text-sm font-semibold m-0 shrink-0">
                -{formatMoney(payment.amount)}
            </p>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── My Bill (room folio: charges + payments) ──
   ══════════════════════════════════════════════════ */
export default function ViewBill() {
    const { roomNumber } = useCustomerProfile();
    const { bill, charges, payments, hasBill, loading, error, refetch } = useBillViewModel();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                <BackButton />

                <h1 className="text-[1.75rem] font-bold m-0 mt-1 leading-tight">
                    My Bill
                </h1>
                {roomNumber && (
                    <p className="text-gray-500 text-sm m-0 mt-1 mb-6">Room {roomNumber}</p>
                )}
                {!roomNumber && <div className="mb-6" />}

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading your bill…</p>
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

                {/* ── Empty ── */}
                {!loading && !error && !hasBill && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <p className="text-gray-400 text-base font-medium m-0">No bill yet</p>
                        <p className="text-gray-600 text-sm m-0 text-center">
                            Charges from your stay will appear here.
                        </p>
                    </div>
                )}

                {/* ── Bill ── */}
                {!loading && !error && hasBill && (
                    <>
                        {/* Summary card */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[rgba(55,55,55,0.6)] mb-5">
                            <SummaryRow label="Total Charges" value={formatMoney(bill?.totalCharges)} />
                            <SummaryRow label="Total Paid" value={`-${formatMoney(bill?.totalPaid)}`} credit />
                            <div className="border-t border-dashed border-[#3A3A3A] mt-1 pt-1">
                                <SummaryRow label="Balance Due" value={formatMoney(bill?.balanceDue)} strong />
                            </div>
                            {Number(bill?.overpaidAmount) > 0 && (
                                <SummaryRow label="Overpaid" value={formatMoney(bill?.overpaidAmount)} credit />
                            )}
                        </div>

                        {/* Charges */}
                        {charges.length > 0 && (
                            <>
                                <h2 className="text-yellow-400/80 text-sm font-semibold m-0 mb-2">Charges</h2>
                                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-1 border border-[rgba(55,55,55,0.6)] mb-5">
                                    {charges.map((charge) => (
                                        <ChargeLine key={charge._id} charge={charge} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Payments */}
                        {payments.length > 0 && (
                            <>
                                <h2 className="text-gray-400 text-sm font-semibold m-0 mb-2">Payments</h2>
                                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-1 border border-[rgba(55,55,55,0.6)] mb-5">
                                    {payments.map((payment) => (
                                        <PaymentLine key={payment._id} payment={payment} />
                                    ))}
                                </div>
                            </>
                        )}

                        <p className="text-gray-600 text-xs text-center m-0 mt-auto pt-4">
                            Please settle your bill at the reception desk during checkout.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
