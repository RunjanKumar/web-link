import { ArrowLeft, MoreHorizontal } from "lucide-react";

export default function Header() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <ArrowLeft className="w-7 h-7" />
        <MoreHorizontal className="w-7 h-7" />
      </div>

      <h1 className="text-5xl font-bold">Food Order</h1>

      <p className="text-gray-400 mt-2 text-lg">Room 208</p>
    </div>
  );
}