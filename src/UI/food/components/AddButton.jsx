import useAddButtonViewModel from '../../../viewModel/addButtonViewModel';

export default function AddButton({ item }) {
    const { quantity, handleAdd, handleIncrement, handleDecrement } = useAddButtonViewModel(item);

    if (quantity === 0) {
        return (
            <button
                onClick={handleAdd}
                className="border border-[#E2B124] text-[#E2B124] rounded-[14px] px-4 py-[6px] text-[15px] font-medium hover:bg-[#E2B124] hover:text-[#161616] transition"
            >
                Add
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1 border border-[#E2B124] rounded-[14px] overflow-hidden">
            <button
                onClick={handleDecrement}
                className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
            >
                -
            </button>

            <span className="w-[24px] text-center text-[#E2B124] text-[15px] font-semibold">
                {quantity}
            </span>

            <button
                onClick={handleIncrement}
                className="w-[30px] h-[32px] flex items-center justify-center text-[#E2B124] text-[18px] font-bold hover:bg-[#E2B124]/10 transition"
            >
                +
            </button>
        </div>
    );
}
