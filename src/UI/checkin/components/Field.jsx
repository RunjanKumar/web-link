import { errorCls, hintCls, labelCls } from './formStyles';

/**
 * Field — label + control + inline error/hint, wired for assistive tech.
 *
 * Pass `children` as a function to receive the props the control must spread
 * (`id`, `aria-invalid`, `aria-describedby`, `aria-required`).
 *
 * Pass `group` for composite controls (photo grids, the signature pad, a
 * button + preview): there is no single input a `<label for>` could point at,
 * so the wrapper becomes a labelled `role="group"` carrying the same aria
 * wiring, and the children render as-is.
 */
export default function Field({
    id, label, required, hint, error, group, children,
}) {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    const controlProps = {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required || undefined,
    };

    const labelText = (
        <>
            {label}
            {required && <span className="text-yellow-400 ml-0.5" aria-hidden="true">*</span>}
        </>
    );
    const messages = (
        <>
            {error ? (
                <p id={errorId} role="alert" className={errorCls}>{error}</p>
            ) : null}
            {hint ? <p id={hintId} className={hintCls}>{hint}</p> : null}
        </>
    );

    if (group) {
        const labelId = `${id}-label`;
        return (
            <div
                id={id}
                role="group"
                aria-labelledby={labelId}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                aria-required={required || undefined}
            >
                <span id={labelId} className={labelCls}>{labelText}</span>
                {children}
                {messages}
            </div>
        );
    }

    return (
        <div>
            <label htmlFor={id} className={labelCls}>{labelText}</label>
            {typeof children === 'function' ? children(controlProps) : children}
            {messages}
        </div>
    );
}

/** A titled card that groups a step's fields (mobile: one column; md: two where asked). */
export function SectionCard({ title, subtitle, children }) {
    return (
        <div className="bg-[#141414] border border-gray-800/70 rounded-2xl p-4 mb-4">
            {title ? <h2 className="text-white text-sm font-semibold m-0">{title}</h2> : null}
            {subtitle ? <p className="text-gray-500 text-xs mt-0.5 mb-0">{subtitle}</p> : null}
            <div className={`grid grid-cols-1 gap-4 ${title || subtitle ? 'mt-4' : ''}`}>{children}</div>
        </div>
    );
}
