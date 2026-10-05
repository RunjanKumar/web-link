import AppImage from '../../../../globalComponents/AppImage';
import useCouponCardViewModel from '../../../../viewModel/couponCardViewModel';

export default function CouponCard({ coupon }) {
    const { imageURL, name, handleClick } = useCouponCardViewModel(coupon);

    return (
        <div
            onClick={handleClick}
            className="w-[300px] h-[130px] rounded-[22px] overflow-hidden shrink-0 cursor-pointer active:scale-[0.97] transition-transform"
        >
            <AppImage
                src={imageURL}
                alt="coupon"
                className="w-full h-full object-cover"
            />
            <div> {name}</div>
        </div>
    );
}
