import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './UI/dashboard/dashboard.jsx'
import LightControl from './UI/light/light.jsx'
import AirConditioner from './UI/ac/ac.jsx'
import Chat from './UI/chat/Chat.jsx'
import Reception from './UI/reception/Reception.jsx'
import Feedback from './UI/feedback/Feedback.jsx'
import ServiceRequest from './UI/service/ServiceRequest.jsx'
import ReviewRequest from './UI/service/ReviewRequest.jsx'
import AddDetails from './UI/service/AddDetails.jsx'
import PendingRequest from './UI/service/PendingRequest.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lights" element={<LightControl />} />
        <Route path="/ac" element={<AirConditioner />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/services" element={<ServiceRequest />} />
        <Route path="/services/review" element={<ReviewRequest />} />
        <Route path="/services/add-details" element={<AddDetails />} />
        <Route path="/services/pending" element={<PendingRequest />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
