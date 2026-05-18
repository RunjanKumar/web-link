import useCouponCardViewModel from '../../../../viewModel/couponCardViewModel';

export default function CouponCard({ coupon }) {
    const { imageURL, handleClick } = useCouponCardViewModel(coupon);

    return (
        <div
            onClick={handleClick}
            className="w-[340px] h-[150px] rounded-[22px] overflow-hidden shrink-0 cursor-pointer active:scale-[0.97] transition-transform"
        >
            <img
                src={imageURL}
                alt="coupon"
                className="w-full h-full object-cover"
            />
        </div>
    );
}
