import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCustomerProfile from '../hooks/CustomerProfile';
import { getMyPreArrivalForm } from '../api/service/preArrivalService';

/**
 * PreArrivalCta — invites a guest who has not yet arrived to fill the hotel's
 * pre-arrival questionnaire. Renders nothing once the form is reviewed, when the
 * hotel is not collecting one, or for guests already in house (they have no
 * "before you arrive" left to prepare for).
 */
export default function PreArrivalCta() {
    const navigate = useNavigate();
    const { portalMode } = useCustomerProfile();
    const [state, setState] = useState(null);

    const preArrivalGuest =
        portalMode === 'FORM' || portalMode === 'PRE_CHECKIN_BROWSE';

    useEffect(() => {
        if (!preArrivalGuest) return undefined;
        let cancelled = false;
        (async () => {
            try {
                const res = await getMyPreArrivalForm();
                if (!cancelled) setState(res?.data || null);
            } catch {
                if (!cancelled) setState(null); // stay silent — this is an invitation
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [preArrivalGuest]);

    if (!preArrivalGuest || !state?.form) return null;
    if (state.form.isEnabled === false) return null;
    if (!(state.form.sections || []).length) return null;
    if (state.submission?.status === 'REVIEWED') return null;

    const done = Boolean(state.submission);

    return (
        <button
            type="button"
            onClick={() => navigate('/pre-arrival')}
            className="w-full text-left bg-[#141414] border border-gray-800 rounded-2xl p-4 mb-3
                       flex items-center gap-3 hover:border-yellow-500/40 transition-colors duration-200"
        >
            <span className="h-10 w-10 shrink-0 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">
                    {done ? 'Update your pre-arrival form' : (state.form.title || 'Pre-Arrival Form')}
                </span>
                <span className="block text-xs text-gray-400 mt-0.5">
                    {done
                        ? 'You can still change your answers'
                        : 'Help us prepare your stay — takes a few minutes'}
                </span>
            </span>
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </button>
    );
}
