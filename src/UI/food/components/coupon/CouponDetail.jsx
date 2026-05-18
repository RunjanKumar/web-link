import { useLocation, useNavigate } from 'react-router-dom';
import useCouponDetailViewModel from '../../../../viewModel/couponDetailViewModel';
import CouponDetailHeader from './CouponDetailHeader';
import CouponFoodCard from './CouponFoodCard';

/**
 * ══════════════════════════════════════════════════════════════
 * COUPON DETAIL PAGE
 * ══════════════════════════════════════════════════════════════
 *
 * LEARNING: This page uses a DIFFERENT API than the food page!
 *
 * FOOD PAGE → GET /v1/foodCategory (all categories + foods)
 * THIS PAGE → GET /v1/coupon?couponId=<id> (specific coupon + discounted foods)
 *
 * DATA FLOW:
 *   1. User clicks CouponCard on food page
 *   2. navigate('/coupon-detail', { state: coupon })
 *   3. This page extracts couponId from navigation state
 *   4. CouponDetailViewModel calls GET /v1/coupon?couponId=<id>
 *   5. Backend returns coupon + applicableItemsData (foods with discount prices)
 *   6. ViewModel maps the data → UI renders
 */

export default function CouponDetail() {
    const navigate = useNavigate();
    const { state } = useLocation();

    console.log('[CouponDetail] Page opened');
    console.log('[CouponDetail] Navigation state (from CouponCard click):', state);

    const initialCoupon = state || {};
    const couponId = initialCoupon.id || initialCoupon._id;

    console.log('[CouponDetail] Extracted couponId:', couponId);
    console.log('[CouponDetail] → ViewModel will call GET /v1/coupon?couponId=' + couponId);

    const {
        isLoading,
        error,
        heroImage,
        offerName,
        discountInfo,
        foodItems,
    } = useCouponDetailViewModel(couponId, initialCoupon);

    console.log('[CouponDetail] ViewModel returned:');
    console.log('  isLoading:', isLoading);
    console.log('  error:', error);
    console.log('  offerName:', offerName);
    console.log('  foodItems count:', foodItems?.length);
    console.log('  foodItems:', foodItems);

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-8">

            {/* Hero Banner */}
            <CouponDetailHeader
                heroImage={heroImage}
                discountInfo={discountInfo}
                onBack={() => navigate(-1)}
            />

            {/* Offer Name */}
            <div className="px-5 mt-6">
                <h1 className="text-[32px] font-bold leading-tight">
                    {offerName}
                </h1>
            </div>

            {/* Food Items List */}
            <div className="px-5 mt-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <ErrorState message={error} />
                ) : foodItems?.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="flex flex-col gap-5">
                        {foodItems.map((item) => (
                            <CouponFoodCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex rounded-[24px] overflow-hidden bg-[#161616] border border-[#2A2A2A] animate-pulse"
                >
                    <div className="w-[75%] px-4 py-4 flex flex-col gap-3">
                        <div className="h-5 bg-[#2A2A2A] rounded w-3/4" />
                        <div className="h-4 bg-[#2A2A2A] rounded w-full" />
                        <div className="h-4 bg-[#2A2A2A] rounded w-1/2" />
                        <div className="h-5 bg-[#2A2A2A] rounded w-1/3 mt-2" />
                    </div>
                    <div className="w-[25%] bg-[#2A2A2A]" />
                </div>
            ))}
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="text-center py-12">
            <p className="text-red-400 text-lg">{message}</p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No food items available for this offer</p>
        </div>
    );
}
