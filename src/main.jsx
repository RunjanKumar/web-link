import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './globalComponents/Toast'
import { ServiceRequestProvider } from './context/ServiceRequestContext'
import App from './App.jsx'
import Dashboard from './UI/dashboard/Dashboard.jsx'
import LightControl from './UI/light/light.jsx'
import AirConditioner from './UI/ac/ac.jsx'
import Chat from './UI/chat/Chat.jsx'
import Reception from './UI/reception/Reception.jsx'
import Feedback from './UI/feedback/Feedback.jsx'
import ServiceRequest from './UI/service/ServiceRequest.jsx'
import ReviewRequest from './UI/service/ReviewRequest.jsx'
import AddDetails from './UI/service/AddDetails.jsx'
import BookedService from './UI/service/BookedService.jsx'
import Facilities from './UI/facility/Facilities.jsx'
import FacilityDetail from './UI/facility/FacilityDetail.jsx'
import ReserveTable from './UI/facility/ReserveTable.jsx'
import UpcomingEvents from './UI/facility/UpcomingEvents.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <ServiceRequestProvider>
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
                <Route path="/services/pending" element={<BookedService />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/facilities/detail" element={<FacilityDetail />} />
                <Route path="/facilities/reserve" element={<ReserveTable />} />
                <Route path="/facilities/upcoming-events" element={<UpcomingEvents />} />
              </Routes>
            </BrowserRouter>
          </ServiceRequestProvider>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
