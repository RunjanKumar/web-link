/**
 * Shared Tailwind class strings for the web check-in wizard — one place so
 * every step's inputs look the same (dark theme, yellow focus ring).
 */

const baseInput = 'w-full bg-[#1a1a1a] border rounded-lg px-4 py-3 text-white text-sm '
    + 'placeholder-gray-600 outline-none transition-colors disabled:opacity-50 [color-scheme:dark] box-border';

/** Input / select / textarea class; the red border appears when the field has an error. */
export const inputCls = (hasError) => `${baseInput} ${
    hasError ? 'border-red-500/70 focus:border-red-400' : 'border-gray-800 focus:border-yellow-400/60'
}`;

export const labelCls = 'block text-gray-400 text-xs font-medium mb-1.5';

export const hintCls = 'text-gray-600 text-[11px] leading-relaxed mt-1.5';

export const errorCls = 'text-red-400 text-xs leading-relaxed mt-1.5';

export const cardCls = 'bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4';

export const primaryBtnCls = 'bg-yellow-400 text-black font-semibold text-sm rounded-full px-6 py-3 '
    + 'hover:bg-yellow-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

export const secondaryBtnCls = 'text-yellow-400 text-sm font-medium border border-yellow-400/30 rounded-full px-6 py-3 '
    + 'hover:bg-yellow-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/** The tick-box used for consents and the company toggle (same look as the pre-arrival form). */
export const tickCls = (checked, hasError) => `mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
    checked ? 'bg-yellow-500 border-yellow-500' : hasError ? 'border-red-500/70' : 'border-gray-700'
}`;
