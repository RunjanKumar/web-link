import { useEffect } from 'react';
import { toast } from 'sonner';
import BackButton from '../../globalComponents/BackButton';
import useDincharyaViewModel from '../../viewModel/dincharyaViewModel';
import useCustomerProfile from '../../hooks/CustomerProfile';

/**
 * 'YYYY-MM-DD' → a local Date at midnight. Never `new Date(key)`, which parses
 * the key as UTC and lands on the previous day for guests west of Greenwich.
 */
const toLocalDate = (key) => {
    const [y, m, d] = String(key || '').split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const weekdayOf = (key) => {
    const d = toLocalDate(key);
    return d ? WEEKDAYS[d.getDay()] : '';
};
const dayNumOf = (key) => {
    const d = toLocalDate(key);
    return d ? d.getDate() : '';
};
const longDateOf = (key) => {
    const d = toLocalDate(key);
    return d ? `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '';
};

// Row types come straight from the backend assembler (DINCHARYA_ROW_TYPE).
// Each gets its own accent so the day reads at a glance: rituals are neutral,
// meals amber, therapies violet, hydration cyan.
const TYPE_STYLES = {
    COMMON: { dot: 'bg-gray-500', tag: 'text-gray-400', chip: 'Ritual' },
    MEAL: { dot: 'bg-amber-400', tag: 'text-amber-400', chip: 'Meal' },
    THERAPY: { dot: 'bg-violet-400', tag: 'text-violet-300', chip: 'Therapy' },
    HYDRATION: { dot: 'bg-cyan-400', tag: 'text-cyan-300', chip: 'Hydration' },
};

/**
 * 870 → '2:30 PM'. Only ever applied to `endMinute`: the START label is rendered
 * server-side in the hotel's timezone and is used verbatim, so a guest whose
 * phone is in another timezone still reads the hotel's schedule. Minutes-from-
 * midnight carry no timezone of their own, so formatting one here is safe.
 */
const minuteLabel = (minute) => {
    const m = ((minute % 1440) + 1440) % 1440;
    const h24 = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    return `${h24 % 12 || 12}:${mm} ${h24 >= 12 ? 'PM' : 'AM'}`;
};

function TimelineRow({ row, last }) {
    const style = TYPE_STYLES[row.type] || TYPE_STYLES.COMMON;
    const hasEnd = row.endMinute != null && row.endMinute !== row.minute;
    const time = hasEnd ? `${row.timeLabel} – ${minuteLabel(row.endMinute)}` : row.timeLabel;

    return (
        <div className="flex gap-3">
            {/* rail */}
            <div className="flex flex-col items-center shrink-0 w-3 pt-[6px]">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                {!last && <span className="w-px flex-1 bg-[#2c2c2c] mt-1" />}
            </div>

            <div className="flex-1 pb-5 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-white text-[13px] font-semibold m-0">{time}</p>
                    <p className={`${style.tag} text-[10px] font-semibold uppercase tracking-wide m-0 shrink-0`}>
                        {style.chip}
                    </p>
                </div>

                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-[rgba(55,55,55,0.6)] mt-1.5">
                    <p className="text-white text-sm font-semibold m-0">{row.label}</p>
                    {row.text && (
                        <p className="text-[#A7A7A7] text-[13px] m-0 mt-1 leading-relaxed">{row.text}</p>
                    )}
                    {/* Where to go — already assembled into one line by the server. */}
                    {row.locationLabel && (
                        <p className="text-emerald-400/90 text-xs m-0 mt-2">📍 {row.locationLabel}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ── My Day (Dincharya: the published wellness rhythm) ──
   Only days the wellness team published are reachable; the
   date strip IS that list, so there is nothing else to browse.
   ══════════════════════════════════════════════════ */
export default function MyDay() {
    const { roomNumber } = useCustomerProfile();
    const {
        day, rows, publishedDates, activeDate, selectDate, loading, error, refetch,
    } = useDincharyaViewModel();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const hasDay = Boolean(day) && rows.length > 0;

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white relative flex flex-col">
            <div className="pt-12 px-5 pb-6 flex flex-col flex-1">

                <BackButton />

                <h1 className="text-[1.75rem] font-bold m-0 mt-1 leading-tight">
                    My Day
                </h1>
                <p className="text-gray-500 text-sm m-0 mt-1 mb-6">
                    Your daily wellness rhythm
                    {roomNumber ? ` · Room ${roomNumber}` : ''}
                </p>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400 text-sm">Loading your day…</p>
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 rounded-full text-sm font-semibold border border-yellow-500/60 text-yellow-400 bg-transparent cursor-pointer hover:bg-yellow-400/10 active:scale-95 transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Empty (no stay, no record, or nothing published yet) ── */}
                {!loading && !error && !hasDay && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <p className="text-gray-400 text-base font-medium m-0">Nothing scheduled yet</p>
                        <p className="text-gray-600 text-sm m-0 text-center max-w-[16rem]">
                            Your wellness team will share your daily rhythm here once it is ready.
                        </p>
                    </div>
                )}

                {/* ── The day ── */}
                {!loading && !error && hasDay && (
                    <>
                        {/* Date strip — one chip per published day. More than one
                            day is worth paging through; a single day is just a label. */}
                        {publishedDates.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 mb-5">
                                {publishedDates.map((key) => {
                                    const active = key === activeDate;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => selectDate(key)}
                                            className={`shrink-0 w-[3.25rem] py-2 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-95 ${
                                                active
                                                    ? 'bg-yellow-400 border-yellow-400 text-[#141718]'
                                                    : 'bg-[#1a1a1a] border-[rgba(55,55,55,0.6)] text-white'
                                            }`}
                                        >
                                            <span className={`block text-[10px] font-semibold ${active ? 'text-[#141718]/70' : 'text-gray-500'}`}>
                                                {weekdayOf(key)}
                                            </span>
                                            <span className="block text-base font-bold leading-tight">
                                                {dayNumOf(key)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-[rgba(55,55,55,0.6)] mb-5">
                            <p className="text-white text-sm font-semibold m-0">{longDateOf(activeDate)}</p>
                            {day?.dietDayNumber != null && (
                                <p className="text-gray-500 text-xs m-0 mt-1">
                                    Diet Day {day.dietDayNumber}
                                    {day.dietMenuNumber != null ? ` · Menu ${day.dietMenuNumber}` : ''}
                                </p>
                            )}
                        </div>

                        <div>
                            {rows.map((row, i) => (
                                <TimelineRow
                                    key={`${row.minute}-${row.type}-${i}`}
                                    row={row}
                                    last={i === rows.length - 1}
                                />
                            ))}
                        </div>

                        <p className="text-gray-600 text-xs text-center m-0 mt-auto pt-4">
                            Timings follow the hotel’s schedule. Speak to your wellness team for any change.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
