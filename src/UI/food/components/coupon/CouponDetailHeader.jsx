import { ArrowLeft } from 'lucide-react';
import AppImage from '../../../../globalComponents/AppImage';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON DETAIL HEADER
 * ══════════════════════════════════════════════════════════════
 *
 * The hero banner at the top of the Coupon Detail page.
 * Shows the coupon image full-width with a back button
 * and the discount text overlaid on top.
 */

export default function CouponDetailHeader({ heroImage, discountInfo, onBack }) {
    return (
        <div className="relative w-full h-[220px]">
            {/* Hero Image */}
            {heroImage ? (
                <AppImage
                    src={heroImage}
                    alt="Coupon offer"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1A6B8A] to-[#0D3F52]" />
            )}

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-5 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition hover:bg-black/50"
            >
                <ArrowLeft size={24} className="text-white" />
            </button>

            {/* Discount Text Overlay */}
            {discountInfo?.label && (
                <div className="absolute bottom-6 left-5 z-10">
                    <h2 className="text-white font-extrabold text-[24px] leading-[1.15] uppercase tracking-wide drop-shadow-lg"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                    >
                        {discountInfo.label}
                    </h2>
                </div>
            )}
        </div>
    );
}
