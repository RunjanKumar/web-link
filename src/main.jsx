import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { Toaster } from 'sonner'
import { ServiceRequestProvider } from './context/ServiceRequestContext'
import { FoodOrderProvider } from './context/FoodOrderContext.jsx'
import { CustomerProfileProvider } from './context/CustomerProfileContext.jsx'
import App from './App.jsx'
import Dashboard from './UI/dashboard/dashboardNew.jsx'
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
import Food from './UI/food/food.jsx'
import FoodDetails from './UI/food/components/foodDetail.jsx'
import CouponDetail from './UI/food/components/coupon/CouponDetail.jsx'
import Cart from './UI/food/cart/Cart.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <ServiceRequestProvider>
          <CustomerProfileProvider>
            <FoodOrderProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/food" element={<Food />} />
                  <Route path="/food-details" element={<FoodDetails />} />
                  <Route path="/coupon-detail" element={<CouponDetail />} />
                  <Route path="/cart" element={<Cart />} />
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
            </FoodOrderProvider>
          </CustomerProfileProvider>
        </ServiceRequestProvider>

      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
