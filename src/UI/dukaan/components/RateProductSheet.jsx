import { useState, useEffect } from 'react';

/** Star rating + optional written review for one delivered product. */
export default function RateProductSheet({ target, busy, onClose, onSubmit }) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    // Reset between products, so one review's text never leaks into the next.
    useEffect(() => {
        setRating(5);
        setReview('');
    }, [target?.item?.productId]);

    if (!target) return null;

    const { order, item } = target;

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />

            <div className="relative w-full bg-[#1a1a1a] border-t border-[rgba(55,55,55,0.6)] rounded-t-3xl p-5 pb-8 animate-[slideDown_0.2s_ease-out]">
                <div className="w-10 h-1 rounded-full bg-gray-700 mx-auto mb-5" />

                <h2 className="text-lg font-bold m-0">Rate this</h2>
                <p className="text-sm text-gray-400 m-0 mt-1 mb-5">{item.name}</p>

                <div className="flex justify-center gap-3 mb-5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            onClick={() => setRating(n)}
                            className={`text-3xl bg-transparent border-none cursor-pointer transition-transform duration-150 active:scale-90 ${
                                n <= rating ? 'text-amber-400' : 'text-gray-700'
                            }`}
                            aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Tell us more (optional)"
                    className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-[rgba(55,55,55,0.6)] text-white text-sm outline-none focus:border-yellow-500/60 resize-none mb-5"
                />

                <button
                    onClick={() => onSubmit(order, item.productId, rating, review.trim())}
                    disabled={busy}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-sm border-none cursor-pointer active:scale-95 disabled:opacity-60 transition-transform duration-200"
                >
                    {busy ? 'Saving…' : 'Submit rating'}
                </button>
            </div>
        </div>
    );
}
