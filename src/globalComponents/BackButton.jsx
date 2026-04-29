import { useNavigate } from "react-router-dom"
export default function BackButton(){
    const navigate = useNavigate();
    return(
       <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-white -ml-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
    )
}