import useDepositViewModel from '../../../viewModel/depositViewModel';
import Field from './Field';
import { inputCls, secondaryBtnCls } from './formStyles';

/**
 * DepositCard — an optional "pay some of it now" next to the stay summary.
 *
 * The payment happens on RAZORPAY'S HOSTED PAGE, which this card opens in a new
 * tab. No card details are ever typed into this app. The server caps the amount
 * at what is actually outstanding, so the guest cannot overpay.
 *
 * Renders nothing when the hotel switched the bill module off.
 */
export default function DepositCard() {
    const vm = useDepositViewModel();
    if (!vm.available) return null;

    return (
        <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-white text-sm font-semibold m-0">Pay a deposit now</p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1 m-0">
                        Optional. Settle part of your stay before you arrive and check-out is quicker.
                    </p>
                </div>
                {!vm.open ? (
                    <button
                        type="button"
                        onClick={() => vm.setOpen(true)}
                        className="text-yellow-400 text-xs font-medium border border-yellow-400/30 rounded-full
                                   px-4 py-2 shrink-0 hover:bg-yellow-400/10 transition-colors"
                    >
                        Pay now
                    </button>
                ) : null}
            </div>

            {vm.open ? (
                <div className="mt-4">
                    <Field
                        id="wc-deposit-amount"
                        label="Amount to pay (₹)"
                        error={vm.error}
                        hint="Pay any part of your stay — we cap it at what is still owed."
                    >
                        {(p) => (
                            <input
                                {...p}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                placeholder="e.g. 5000"
                                value={vm.amount}
                                onChange={(e) => vm.changeAmount(e.target.value)}
                                onKeyDown={(e) => {
                                    // This card sits INSIDE the wizard's <form>, whose submit is
                                    // "Next". Left alone, Enter (or Android's Go key) would walk the
                                    // guest off to the next step mid-payment and unmount this card,
                                    // amount and all. Enter here means "pay".
                                    if (e.key !== 'Enter') return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!vm.busy) vm.payDeposit();
                                }}
                                className={inputCls(Boolean(vm.error))}
                            />
                        )}
                    </Field>

                    <div className="flex items-center gap-3 mt-3">
                        <button
                            type="button"
                            onClick={vm.reset}
                            disabled={vm.busy}
                            className="text-gray-400 text-xs font-medium shrink-0 disabled:opacity-50
                                       hover:text-gray-200 transition-colors bg-transparent border-0 p-0 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={vm.payDeposit}
                            disabled={vm.busy}
                            className={`${secondaryBtnCls} flex-1`}
                        >
                            {vm.busy ? 'Opening secure payment…' : 'Continue to payment'}
                        </button>
                    </div>

                    {vm.paymentUrl ? (
                        <div className="mt-3 bg-[#1a1a1a] border border-gray-800 rounded-xl p-3">
                            <p className="text-gray-300 text-xs leading-relaxed m-0">
                                Your payment page is open in a new tab. Finish there and your bill updates
                                automatically.
                            </p>
                            <a
                                href={vm.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 text-xs underline inline-block mt-2"
                            >
                                Open the payment page again
                            </a>
                        </div>
                    ) : null}

                    <p className="text-gray-600 text-[11px] leading-relaxed mt-3 m-0">
                        You pay on Razorpay&apos;s secure page — your card details never touch this app or
                        the hotel&apos;s systems.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
