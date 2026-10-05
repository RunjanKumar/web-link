import useCouponDetailViewModel from '../../../../viewModel/couponDetailViewModel';
import CouponDetailHeader from './CouponDetailHeader';
import CouponFoodCard from './CouponFoodCard';

export default function CouponDetail() {
    const {
        isLoading,
        error,
        heroImage,
        offerName,
        discountInfo,
        foodItems,
        handleBack,
    } = useCouponDetailViewModel();

    return (
        <div className="min-h-screen bg-[#111111] text-white pb-8">
            <CouponDetailHeader
                heroImage={heroImage}
                discountInfo={discountInfo}
                onBack={handleBack}
            />

            <div className="px-5 mt-6">
                <h1 className="text-[24px] font-bold leading-tight">
                    {offerName}
                </h1>
            </div>

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
