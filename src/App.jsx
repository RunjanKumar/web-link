import { useNavigate } from 'react-router-dom';
import banner from './assets';
import './index.css'
export default function App() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">

      {/* Top Image Section */}
      <div className="w-full h-[65vh] overflow-hidden">
        <img
          src={banner} // 👉 put your image in public folder
          alt="hotel services"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom Content */}
      <div className="px-5 pb-6 text-center bordeborder-black">
        <p className="text-gray-300 text-sm leading-relaxed">
          Welcome! Take control of your stay with easy room adjustments,
          meal orders, staff chats, and service requests—all at your
          fingertips. Let's make your experience exceptional
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-300 text-black py-4 rounded-full font-semibold text-lg"
        >
          Login
        </button>
      </div>
    </div>
  );
}
