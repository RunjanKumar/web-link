export default function OfferSlider() {
  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold mb-5">
        Special Offers
      </h2>

      <div className="flex gap-5 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <img
          src="https://images.unsplash.com/photo-1512058564366-18510be2db19"
          alt=""
          className="w-[320px] h-[180px] rounded-[30px] object-cover shrink-0"
        />

        <img
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          alt=""
          className="w-[320px] h-[180px] rounded-[30px] object-cover shrink-0"
        />
      </div>
    </div>
  );
}