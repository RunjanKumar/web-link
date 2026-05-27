import BackButton from "../../../globalComponents/BackButton";
import ThreeDotMenu from "../../../globalComponents/ThreeDotMenu";
import useFoodViewModel from "../../../viewModel/foodViewModel";

export default function Header() {
  const { menuItems } = useFoodViewModel();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        {/* <ArrowLeft className="w-7 h-7" /> */}
        <BackButton />
        <ThreeDotMenu items={menuItems} />
      </div>

      <h1 className="text-5xl font-bold">Food Order</h1>

      {/* <p className="text-gray-400 mt-2 text-lg">Room 208</p> */}
    </div>
  );
}