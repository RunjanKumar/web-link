import { primaryBtnCls, secondaryBtnCls } from './formStyles';

/**
 * StepNav — Back / Next (or Submit) for the wizard. Next is the form's submit
 * button so Enter advances; Back never submits.
 */
export default function StepNav({
    showBack, onBack, nextLabel, busy, busyLabel, disabled,
}) {
    return (
        <div className="flex items-center gap-3 mt-2 mb-8">
            {showBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    disabled={busy}
                    className={`${secondaryBtnCls} shrink-0`}
                >
                    ← Back
                </button>
            ) : null}
            <button
                type="submit"
                disabled={busy || disabled}
                className={`${primaryBtnCls} flex-1`}
            >
                {busy ? (busyLabel || 'Please wait…') : nextLabel}
            </button>
        </div>
    );
}
