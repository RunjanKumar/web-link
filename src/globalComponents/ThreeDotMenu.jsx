import { useState, useRef, useEffect } from 'react';

/**
 * Reusable Three Dot Menu component.
 * 
 * @param {Array} items - Array of menu items: [{ label: string, onClick: function }]
 * 
 * Usage:
 *   <ThreeDotMenu items={[
 *     { label: 'Share feedback', onClick: () => {} },
 *     { label: 'Logout out', onClick: () => {} },
 *   ]} />
 */
export default function ThreeDotMenu({ items = [] }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="relative" ref={menuRef}>
            {/* ── Three Dot Button ── */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full border border-gray-700 bg-transparent flex items-center justify-center cursor-pointer shrink-0 hover:bg-white/5"
            >
                <svg width="4" height="18" viewBox="0 0 4 18" fill="none">
                    <circle cx="2" cy="2" r="1.8" fill="white" />
                    <circle cx="2" cy="9" r="1.8" fill="white" />
                    <circle cx="2" cy="16" r="1.8" fill="white" />
                </svg>
            </button>

            {/* ── Dropdown Menu ── */}
            {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg py-2 min-w-[170px] z-50">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => { setMenuOpen(false); item.onClick?.(); }}
                            className="w-full text-left px-5 py-3 text-sm font-medium text-[#0d0d0d] bg-transparent border-none cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
