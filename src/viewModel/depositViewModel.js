import { useCallback, useState } from 'react';
import { createDepositLink } from '../api/service/webCheckInService';
import { getApiErrorMessage } from '../api/client';
import useCustomerProfile from '../hooks/CustomerProfile';

/**
 * Deposit / prepayment view-model.
 *
 * The guest pays on RAZORPAY'S OWN HOSTED PAGE: this app asks the backend for a
 * payment link and opens it. No card number, expiry or CVV ever enters this
 * app — there is nothing here to leak, by design (RBI).
 *
 * The amount is in RUPEES and the server caps it at the outstanding balance, so
 * the guest can never overpay their folio. A pre-arrival guest cannot read their
 * own folio yet (the bill route needs an active stay), which is why there is no
 * balance on screen to pre-fill from — the cap is enforced on the way in
 * instead, and INSTALLMENT_EXCEEDS_BALANCE is what tells us we hit it.
 */

const EXCEEDS_BALANCE = /exceeds the outstanding balance/i;

export default function useDepositViewModel() {
    const { isModuleEnabled } = useCustomerProfile();

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');

    // Paying toward the bill follows the View Bill module — a hotel that
    // switched it off has the server refuse this route too.
    const available = isModuleEnabled('BILL');

    const reset = useCallback(() => {
        setOpen(false);
        setAmount('');
        setError('');
        setPaymentUrl('');
    }, []);

    const changeAmount = useCallback((value) => {
        // Digits and at most one decimal point — a rupee amount, nothing else.
        setAmount(String(value).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'));
        setError('');
    }, []);

    /** Ask for a Razorpay link and open it. Returns nothing — state carries the outcome. */
    const payDeposit = useCallback(async () => {
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) {
            setError('Please enter the amount you would like to pay.');
            return;
        }

        setBusy(true);
        setError('');
        setPaymentUrl('');
        try {
            const response = await createDepositLink({
                amount: value,
                // Razorpay returns the browser here once the guest is done.
                callbackUrl: `${window.location.origin}${window.location.pathname}`,
            });
            const url = response?.data?.paymentLink?.shortUrl;
            if (!url) throw new Error('We could not start this payment. Please try again.');
            // Kept on screen as well — a blocked pop-up must not lose the link.
            setPaymentUrl(url);
            window.open(url, '_blank', 'noopener');
        } catch (err) {
            const message = getApiErrorMessage(err, 'We could not start this payment. Please try again.');
            setError(EXCEEDS_BALANCE.test(message)
                ? 'That is more than what is left to pay on your stay. Try a smaller amount — and if you '
                  + 'have just paid, that payment may still be going through.'
                : message);
        } finally {
            setBusy(false);
        }
    }, [amount]);

    return {
        available,
        open,
        setOpen,
        amount,
        changeAmount,
        busy,
        error,
        paymentUrl,
        payDeposit,
        reset,
    };
}
