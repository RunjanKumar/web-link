/**
 * SubmitButton – Gradient submit button with loading state.
 *
 * @param {function} onClick  – Submit handler
 * @param {boolean}  loading  – When true, shows "Submitting…" and disables the button
 */
export default function SubmitButton({ onClick, loading }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer transition-all duration-200 hover:brightness-110 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {loading ? 'Submitting…' : 'Submit'}
        </button>
    );
}
