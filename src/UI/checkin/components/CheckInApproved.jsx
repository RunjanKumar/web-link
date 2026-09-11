import DepositCard from './DepositCard';
import { primaryBtnCls, secondaryBtnCls } from './formStyles';

/**
 * CheckInApproved — the hotel approved the registration. Reads the submission
 * back, explains what happens on arrival, and offers the registration card PDF.
 */
export default function CheckInApproved({
    checkInDate, summary, onExplore, onDownloadCard, cardLoading, cardUrl,
}) {
    const arrivalLabel = checkInDate ? new Date(checkInDate).toDateString() : null;
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            <div className="max-w-md md:max-w-2xl mx-auto px-4 pt-10 pb-10">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-green-800 flex items-center justify-center mb-6">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                            stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold m-0 mb-3 leading-tight">You&apos;re all set!</h1>
                    <p className="text-gray-400 text-sm leading-relaxed m-0 max-w-[320px]">
                        The hotel approved your web check-in
                        {arrivalLabel ? ` — see you on ${arrivalLabel}.` : '.'}
                    </p>

                    <div className="w-full flex flex-col sm:flex-row items-stretch gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onDownloadCard}
                            disabled={cardLoading}
                            className={`${secondaryBtnCls} flex-1`}
                        >
                            {cardLoading ? 'Preparing your card…' : 'Download my registration card'}
                        </button>
                        <button type="button" onClick={onExplore} className={`${primaryBtnCls} flex-1`}>
                            Explore the hotel →
                        </button>
                    </div>
                    {cardUrl ? (
                        <a
                            href={cardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 text-xs mt-3 underline"
                        >
                            Open registration card (PDF)
                        </a>
                    ) : null}
                </div>

                <section className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mt-8 mb-6">
                    <h2 className="text-white text-sm font-semibold m-0 mb-3">What happens on arrival</h2>
                    <ol className="m-0 pl-5 text-gray-400 text-sm leading-relaxed flex flex-col gap-2">
                        <li>
                            <span className="text-gray-200">Show your ID at the desk.</span>
                            {' '}Carry the original of the document you uploaded — the front desk verifies it against this registration.
                        </li>
                        <li>
                            <span className="text-gray-200">Collect your key.</span>
                            {' '}Your registration card is already prepared, so the handover takes a moment.
                        </li>
                        <li>
                            <span className="text-gray-200">Ordering unlocks at check-in.</span>
                            {' '}Browse everything now; room service, the shop and requests open the moment you are checked in.
                        </li>
                    </ol>
                </section>

                {/* Once approved the wizard is behind them, so the prepayment
                    option lives here too — same card, same hosted-page rule. */}
                <DepositCard />

                {summary ? (
                    <>
                        <h2 className="text-white text-sm font-semibold m-0 mb-3">What you submitted</h2>
                        {summary}
                    </>
                ) : null}

                <p className="text-gray-600 text-xs leading-relaxed text-center mt-6">
                    Need to change something? Speak to the front desk on arrival.
                </p>
            </div>
        </div>
    );
}
