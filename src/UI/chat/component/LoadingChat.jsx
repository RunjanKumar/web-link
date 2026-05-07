/**
 * LoadingChat — skeleton loader shown while initial messages are loading.
 * Renders animated placeholder bubbles.
 */
export default function LoadingChat() {
    // Alternate between left-aligned and right-aligned skeleton bubbles
    const skeletons = [
        { align: 'left', width: '60%' },
        { align: 'right', width: '70%' },
        { align: 'left', width: '45%' },
        { align: 'right', width: '55%' },
        { align: 'left', width: '65%' },
        { align: 'right', width: '50%' },
    ];

    return (
        <div className="flex-1 flex flex-col gap-4 py-3 px-1">
            {skeletons.map((s, i) => (
                <div
                    key={i}
                    className={`flex ${s.align === 'right' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className="rounded-2xl bg-[#1a1a1a] animate-pulse"
                        style={{
                            width: s.width,
                            height: '52px',
                            animationDelay: `${i * 100}ms`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
