import { toast } from 'sonner';

/**
 * ══════════════════════════════════════════════════════════════
 * RAZORPAY CHECKOUT HELPER
 * ══════════════════════════════════════════════════════════════
 * The checkout script is loaded globally in index.html, so `window.Razorpay`
 * is available here without any import.
 *
 * WHY THIS FILE EXISTS: this logic was written twice already (cartViewModel and
 * orderHistoryViewModel) and Dukaan would have been a third copy. The two food
 * copies are left alone deliberately — rewriting a working payment path is not
 * worth the risk — but nothing new should duplicate it again.
 *
 * Resolves TRUE only when the payment was captured AND verified. Dismissing the
 * sheet resolves FALSE; the order still exists and stays unpaid, which is what
 * lets a guest come back and pay later.
 */
export function openRazorpayCheckout({
    paymentData,
    name,
    description,
    customer,
    onVerify,
}) {
    return new Promise((resolve) => {
        if (!window.Razorpay) {
            toast.error('Payment is unavailable right now. Please try again.');
            resolve(false);
            return;
        }

        const options = {
            key: paymentData.razorpayKey,
            amount: paymentData.amount,
            currency: paymentData.currency || 'INR',
            order_id: paymentData.razorpayOrderId,
            name: name || 'Hotel',
            description,
            prefill: {
                name: customer?.name || '',
                contact: customer?.phone || customer?.mobile || '',
                email: customer?.email || '',
            },

            handler: async function (response) {
                try {
                    await onVerify({
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    });
                    toast.success('Payment successful');
                    resolve(true);
                } catch {
                    // The money may well have left the guest's account, so never
                    // imply the payment failed — tell them it needs checking and
                    // give them a reference they can quote.
                    toast.error('We could not confirm your payment. Please contact the front desk.');
                    resolve(false);
                }
            },

            modal: {
                ondismiss: function () {
                    resolve(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
        });
        rzp.open();
    });
}
