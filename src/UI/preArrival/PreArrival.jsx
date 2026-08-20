import BackButton from '../../globalComponents/BackButton';
import FormField from './components/FormField';
import {
    usePreArrivalViewModel,
    isFieldVisible,
} from '../../viewModel/preArrivalViewModel';
import useCustomerProfile from '../../hooks/CustomerProfile';

/**
 * The hotel's pre-arrival questionnaire. Every hotel asks something different, so
 * nothing here is hard-coded — the sections and fields come from the server and
 * this page walks them.
 *
 * All logic lives in preArrivalViewModel; this component only renders.
 */
export default function PreArrival() {
    const vm = usePreArrivalViewModel();
    const { hotelData } = useCustomerProfile();

    const shell = (children) => (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">{children}</div>
        </div>
    );

    if (vm.loading) {
        return shell(
            <>
                <BackButton />
                <div className="mt-10 space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-2xl bg-[#141414] border border-gray-800 animate-pulse"
                        />
                    ))}
                </div>
            </>,
        );
    }

    if (vm.loadError) {
        return shell(
            <>
                <BackButton />
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-base font-semibold">Could not load the form</p>
                    <p className="text-sm text-gray-500 mt-1">{vm.loadError}</p>
                    <button
                        type="button"
                        onClick={vm.reload}
                        className="mt-5 px-6 py-3 rounded-full bg-[#141414] border border-gray-800 text-sm"
                    >
                        Try again
                    </button>
                </div>
            </>,
        );
    }

    if (!vm.isEnabled) {
        return shell(
            <>
                <BackButton />
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-base font-semibold">Nothing to fill in</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {hotelData?.name || 'The hotel'} is not collecting pre-arrival
                        forms right now.
                    </p>
                </div>
            </>,
        );
    }

    return shell(
        <>
            <BackButton />

            {/* ── Cover ── */}
            <div className="mt-6">
                <h1 className="text-2xl font-semibold m-0">
                    {vm.form?.title || 'Pre-Arrival Form'}
                </h1>
                {hotelData?.name ? (
                    <p className="text-sm text-yellow-500 mt-1">{hotelData.name}</p>
                ) : null}
                {vm.form?.tagline ? (
                    <p className="text-sm text-gray-400 italic mt-1">
                        {vm.form.tagline}
                    </p>
                ) : null}
                {vm.form?.welcomeText ? (
                    <p className="text-sm text-gray-400 leading-relaxed mt-4 whitespace-pre-line">
                        {vm.form.welcomeText}
                    </p>
                ) : null}
            </div>

            {/* ── Status banners ── */}
            {vm.isLocked ? (
                <div className="mt-5 rounded-2xl border border-emerald-800/60 bg-emerald-500/10 p-4">
                    <p className="text-sm font-semibold text-emerald-400 m-0">
                        Your form has been received
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Our team has read it. To change anything, please speak to the
                        front desk.
                    </p>
                </div>
            ) : vm.hasSubmitted ? (
                <div className="mt-5 rounded-2xl border border-gray-800 bg-[#141414] p-4">
                    <p className="text-sm font-semibold m-0">Already submitted</p>
                    <p className="text-xs text-gray-400 mt-1">
                        You can still change your answers until our team reviews them.
                    </p>
                </div>
            ) : null}

            {/* ── The questions ── */}
            <div className="mt-6 space-y-7">
                {vm.sections.map((section) => {
                    const visible = (section.fields || []).filter((f) =>
                        isFieldVisible(f, vm.answers),
                    );
                    if (!visible.length) return null;

                    return (
                        <div key={section.key}>
                            <h2 className="text-base font-semibold m-0">
                                {section.label}
                            </h2>
                            {section.description ? (
                                <p className="text-xs text-gray-500 mt-1 mb-4">
                                    {section.description}
                                </p>
                            ) : (
                                <div className="mb-4" />
                            )}

                            <div className="space-y-4">
                                {visible.map((field) => (
                                    <FormField
                                        key={field.key}
                                        field={field}
                                        value={vm.answers[field.key]}
                                        otherValue={vm.otherAnswers[field.key]}
                                        disabled={vm.isLocked}
                                        onChange={(v) => vm.setAnswer(field.key, v)}
                                        onToggle={(v) => vm.toggleChoice(field.key, v)}
                                        onOtherChange={(v) => vm.setOther(field.key, v)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-1" />

            {!vm.isLocked ? (
                <button
                    type="button"
                    onClick={vm.submit}
                    disabled={vm.submitting}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black py-4 rounded-full font-semibold text-lg border-none cursor-pointer mt-8 shadow-lg shadow-yellow-500/20 disabled:opacity-60"
                >
                    {vm.submitting
                        ? 'Submitting…'
                        : vm.hasSubmitted
                          ? 'Update my answers'
                          : 'Submit'}
                </button>
            ) : null}
        </>,
    );
}
