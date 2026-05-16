import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const addons = [
  {
    id: 1,
    name: "Pepper Julienned",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999",
  },
  {
    id: 2,
    name: "Baby Spinach",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
  },
];

export default function FoodDetails() {

  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-[#111111] text-white pb-[120px]">

      {/* Top Image */}
      <div className="relative">

        <img
          src={state?.image}
          alt=""
          className="w-full h-[360px] object-cover"
        />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-5"
        >
          <ArrowLeft size={30} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pt-6">

        {/* Title */}
        <div className="flex items-center justify-between">

          <h1 className="text-[36px] font-semibold leading-[42px]">
            {state?.title}
          </h1>

          <div className="w-[48px] h-[48px] rounded-[16px] border border-red-500 flex items-center justify-center">
            <div className="w-[18px] h-[18px] bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Description */}
        <div className="mt-10">

          <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
            Description
          </h2>

          <p className="text-[#9E9E9E] text-[17px] leading-[32px] mt-4">
            A classic favorite, our chicken burger features a juicy,
            grilled or breaded chicken patty served on a soft bun,
            accompanied by crisp lettuce, ripe tomatoes, sliced
            onions, and your choice of condiments.
          </p>
        </div>

        {/* Ingredients */}
        <div className="mt-10">

          <h2 className="text-[20px] font-semibold text-[#CFCFCF]">
            Ingredients
          </h2>

          <p className="text-[#9E9E9E] text-[17px] leading-[32px] mt-4">
            20g Lorem ipsum, 8g Dolor sit, 12g Amet,
            5g Consectetur, 4g Adipiscing
          </p>
        </div>

        {/* Addons */}
        <div className="mt-10">

          <h2 className="text-[20px] font-semibold text-[#CFCFCF] mb-6">
            Choice of Add On
          </h2>

          <div className="flex flex-col gap-6">

            {addons.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >

                {/* Left */}
                <div className="flex items-center gap-4">

                  <img
                    src={item.image}
                    alt=""
                    className="w-[60px] h-[60px] rounded-full object-cover"
                  />

                  <p className="text-[18px]">
                    {item.name}
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">

                  <p className="text-[18px]">
                    + ₹50
                  </p>

                  <div
                    className={`w-[36px] h-[36px] rounded-full border-2 ${
                      index === 0
                        ? "border-yellow-400"
                        : "border-gray-500"
                    } flex items-center justify-center`}
                  >
                    {index === 0 && (
                      <div className="w-[20px] h-[20px] bg-yellow-400 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2B2B2B] px-5 py-5 flex items-center gap-4">

        {/* Counter */}
        <div className="w-[120px] h-[60px] rounded-[22px] border border-[#5A5A5A] flex items-center justify-around">

          <button className="text-yellow-400 text-[28px]">
            -
          </button>

          <p className="text-[28px]">
            1
          </p>

          <button className="text-yellow-400 text-[28px]">
            +
          </button>
        </div>

        {/* Add Button */}
        <button className="flex-1 h-[60px] bg-yellow-400 rounded-[22px] text-black text-[22px] font-semibold">
          Add items - ₹ 300
        </button>
      </div>
    </div>
  );
}