import { useState } from 'react';

/**
 * ExpandableDescription — Shows text with "Show More / Show Less"
 * toggle when content exceeds charLimit.
 * Reused in: FacilityDetail, and any future detail pages.
 */
export default function ExpandableDescription({ text, charLimit = 150 }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    const isLong = text.length > charLimit;

    return (
        <div>
            <h3 className="text-white/70 text-[18px] font-semibold leading-[100%] m-0 mb-2">Description</h3>
            <p className="text-gray-400 text-sm m-0 leading-relaxed">
                {expanded || !isLong ? text : `${text.slice(0, charLimit)}...`}
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-white font-semibold text-sm bg-transparent border-none cursor-pointer p-0 ml-0.5 hover:text-yellow-400 transition-colors duration-150"
                    >
                        {expanded ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </p>
        </div>
    );
}
