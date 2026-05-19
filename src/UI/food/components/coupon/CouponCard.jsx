import useCouponCardViewModel from '../../../../viewModel/couponCardViewModel';

export default function CouponCard({ coupon }) {
    const { imageURL, name, handleClick } = useCouponCardViewModel(coupon);
    // console.log("name--------", name);

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
            <div> {name}</div>
        </div>
    );
}
