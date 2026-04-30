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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
