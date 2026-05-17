import { useNavigate } from "react-router-dom";
import useGlobal from "../../../hooks/FoodOrder";

export default function FoodCard({ item }) {

    const navigate = useNavigate();
    const { addToFoodCart,foodCart } = useGlobal();

    const handleNavigate = () => {
        navigate("/food-details", {
            state: item,
        });
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToFoodCart(item);
        console.log("Added to cart:", item);
        console.log("Food Cart:", foodCart);
    };


    return (
        <div onClick={() => { handleNavigate() }} className="flex border border-[#3A3A3A] rounded-[24px] overflow-hidden bg-[#161616] items-center">

            {/* Left Content - 75% */}
            <div className="w-[75%] px-4 py-4 flex flex-col justify-between">

                <div>
                    <h2 className="text-white text-[18px] font-semibold leading-[22px]">
                        {item.title}
                    </h2>

                    <p className="text-[#8F8F8F] text-[14px] leading-[20px] mt-2 line-clamp-2">
                        A classic favorite, our chicken burger
                        features a juicy, grilled or crispy...
                    </p>

                    <p className="text-[#A0A0A0] text-[15px] mt-2">
                        200 Kcal
                    </p>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between">

                    <h3 className="text-[#E2B124] text-[20px] font-semibold">
                        ₹ {item.price}
                    </h3>

                    <button 
                        onClick={handleAddToCart}
                        className="border border-[#E2B124] text-[#E2B124] rounded-[14px] px-4 py-[6px] text-[15px] font-medium hover:bg-[#E2B124] hover:text-[#161616] transition"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Right Image - 25% */}
            <div className="w-[35%] h-full">

                <img
                    src={item?.imageURL}
                    alt=""
                    className="w-[142px] h-[131px]"
                />
            </div>
        </div>
    );
}