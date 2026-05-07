/**
 * DateDivider — visual separator between message groups by date.
 * Shows "Today", "Yesterday", or a formatted date string.
 */
export default function DateDivider({ date }) {
    const formatDateLabel = (dateStr) => {
        const msgDate = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset hours for comparison
        const resetTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (resetTime(msgDate).getTime() === resetTime(today).getTime()) {
            return 'Today';
        }
        if (resetTime(msgDate).getTime() === resetTime(yesterday).getTime()) {
            return 'Yesterday';
        }

        return msgDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
    };

    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-gray-500 font-medium tracking-wider uppercase px-2">
                {formatDateLabel(date)}
            </span>
            <div className="flex-1 h-px bg-white/10" />
        </div>
    );
}
