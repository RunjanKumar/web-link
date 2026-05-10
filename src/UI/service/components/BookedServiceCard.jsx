import { formattedDate, formattedTime } from "../../../utils/commonFunction";
import { BOOKING_STATUS, STATUS_LABELS, STATUS_STYLES } from "../../../utils/constant"

/* ── Single pending service card (status only, no action buttons) ── */
export default function BookedServiceCard({ item }) {
    const isCompleted = item.status === BOOKING_STATUS.COMPLETED;
    const isCancelled = item.status === BOOKING_STATUS.CANCEL;

    return (
        <div className={`bg-[#111111] rounded-xl border border-gray-800/40 px-4 py-4 mb-3 transition-opacity duration-300 ${(isCompleted || isCancelled) ? 'opacity-50' : ''}`}>
            {/* Top row: name + time */}
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-white text-sm font-semibold m-0 leading-snug">{item.name}</h4>
                <span className="text-gray-400 text-xs shrink-0">{formattedDate(item.requestedAt)} {formattedTime(item.requestedAt)}</span>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-xs m-0 mt-1 leading-relaxed">{item.description}</p>

            {/* Details (if added) */}
            {item.details && (
                <p className="text-yellow-400/70 text-xs m-0 mt-1.5 leading-relaxed italic">
                    Details : {item.details}
                </p>
            )}

            {/* Status badge */}
            <div className="flex items-center justify-end mt-3">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                </span>
            </div>
        </div>
    );
}