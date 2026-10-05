/**
 * StepHeader — "Step n of N", the step's title and a progress bar. Announces
 * progress to screen readers through the progressbar role.
 */
export default function StepHeader({
    index, total, title, subtitle, errorCount,
}) {
    const percent = Math.round(((index + 1) / total) * 100);
    return (
        <div className="mb-5">
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase m-0">
                    Step {index + 1} of {total}
                </p>
                <p className="text-gray-600 text-xs m-0">{percent}%</p>
            </div>
            <div
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={index + 1}
                aria-label={`Step ${index + 1} of ${total}: ${title}`}
                className="h-1.5 w-full rounded-full bg-gray-800 mt-2 overflow-hidden"
            >
                <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <h2 className="text-xl font-bold m-0 mt-4 leading-tight">{title}</h2>
            {subtitle ? <p className="text-gray-400 text-sm mt-1 m-0 leading-relaxed">{subtitle}</p> : null}
            {errorCount > 0 ? (
                <p role="alert" className="text-red-300 text-xs mt-3 m-0 bg-red-900/40 border border-red-800/60 rounded-xl px-3 py-2">
                    {errorCount === 1
                        ? 'Please fix the highlighted field to continue.'
                        : `Please fix the ${errorCount} highlighted fields to continue.`}
                </p>
            ) : null}
        </div>
    );
}
