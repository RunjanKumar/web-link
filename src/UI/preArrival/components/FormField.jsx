import { FIELD } from '../../../viewModel/preArrivalViewModel';

/**
 * Renders ONE question from the hotel's form. The questions are data, so this is
 * a switch on the field type rather than a hand-written input per question.
 */

const inputCls =
    'w-full bg-[#141414] text-white text-sm rounded-xl px-4 py-4 border border-gray-800 outline-none box-border focus:border-yellow-500/50 transition-colors duration-200';

const chipCls = (selected) =>
    `px-4 py-2.5 rounded-full text-sm border transition-colors duration-200 cursor-pointer ${
        selected
            ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400 font-semibold'
            : 'bg-[#141414] border-gray-800 text-gray-300'
    }`;

export default function FormField({
    field,
    value,
    otherValue,
    disabled,
    onChange,
    onToggle,
    onOtherChange,
}) {
    if (field.type === FIELD.INFO) {
        return (
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4">
                {field.label ? (
                    <p className="text-sm font-semibold text-white mb-1">{field.label}</p>
                ) : null}
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {field.helpText}
                </p>
            </div>
        );
    }

    const label = (
        <label className="block text-sm text-gray-300 mb-2">
            {field.label}
            {field.required ? <span className="text-yellow-500"> *</span> : null}
        </label>
    );

    const hint = field.helpText ? (
        <p className="text-xs text-gray-600 mt-1.5">{field.helpText}</p>
    ) : null;

    const renderControl = () => {
        switch (field.type) {
            case FIELD.TEXTAREA:
                return (
                    <textarea
                        className={`${inputCls} rounded-2xl resize-none placeholder-gray-600 min-h-[110px]`}
                        placeholder={field.placeholder || ''}
                        value={value || ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            case FIELD.DATE:
                return (
                    <input
                        type="date"
                        className={`${inputCls} [color-scheme:dark]`}
                        value={value ? String(value).slice(0, 10) : ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            case FIELD.NUMBER:
                return (
                    <input
                        type="number"
                        className={inputCls}
                        placeholder={field.placeholder || ''}
                        value={value ?? ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            case FIELD.EMAIL:
            case FIELD.PHONE:
                return (
                    <input
                        type={field.type === FIELD.EMAIL ? 'email' : 'tel'}
                        className={inputCls}
                        placeholder={field.placeholder || ''}
                        value={value || ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            case FIELD.YES_NO:
                return (
                    <div className="flex gap-3">
                        {['YES', 'NO'].map((v) => (
                            <button
                                key={v}
                                type="button"
                                disabled={disabled}
                                className={chipCls(value === v)}
                                onClick={() => onChange(v)}
                            >
                                {v === 'YES' ? 'Yes' : 'No'}
                            </button>
                        ))}
                    </div>
                );

            case FIELD.SELECT:
                return (
                    <div className="flex flex-wrap gap-2">
                        {(field.options || []).map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                className={chipCls(value === opt.value)}
                                onClick={() => onChange(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                );

            case FIELD.MULTI_SELECT: {
                const picked = Array.isArray(value) ? value : [];
                return (
                    <div className="flex flex-wrap gap-2">
                        {(field.options || []).map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                className={chipCls(picked.includes(opt.value))}
                                onClick={() => onToggle(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                );
            }

            case FIELD.CONSENT:
                return (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(value !== true)}
                        className="flex items-start gap-3 text-left w-full"
                    >
                        <span
                            className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center ${
                                value === true
                                    ? 'bg-yellow-500 border-yellow-500'
                                    : 'border-gray-700'
                            }`}
                        >
                            {value === true ? (
                                <svg
                                    className="h-3 w-3 text-black"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : null}
                        </span>
                        <span className="text-sm text-gray-300 leading-relaxed">
                            {field.label}
                            {field.required ? (
                                <span className="text-yellow-500"> *</span>
                            ) : null}
                        </span>
                    </button>
                );

            case FIELD.SIGNATURE:
                return (
                    <input
                        className={`${inputCls} font-serif italic text-base`}
                        placeholder="Type your full name"
                        value={value || ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            case FIELD.TEXT:
            default:
                return (
                    <input
                        className={inputCls}
                        placeholder={field.placeholder || ''}
                        value={value || ''}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
        }
    };

    return (
        <div>
            {/* CONSENT carries its own wording next to the tick-box. */}
            {field.type === FIELD.CONSENT ? null : label}
            {renderControl()}
            {field.allowOther ? (
                <input
                    className={`${inputCls} mt-2`}
                    placeholder={field.otherLabel || 'Others (please specify)'}
                    value={otherValue || ''}
                    disabled={disabled}
                    onChange={(e) => onOtherChange(e.target.value)}
                />
            ) : null}
            {field.type === FIELD.CONSENT ? null : hint}
        </div>
    );
}
