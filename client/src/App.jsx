// Main application component defining client-side routing and page layouts
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PanchayatRoute from './components/PanchayatRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Schemes from './pages/Schemes';
import Mandi from './pages/Mandi';
import Notices from './pages/Notices';
import Helpline from './pages/Helpline';
import Members from './pages/Members';

// Protected villager & user pages
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import CartPage from './pages/CartPage';
import Events from './pages/Events';
import Complaints from './pages/Complaints';

// Protected Panchayat administration pages
import Reports from './pages/Reports';
import UserManagement from './pages/panchayat/UserManagement';
import SchemeManagement from './pages/panchayat/SchemeManagement';
import ApplicationManagement from './pages/panchayat/ApplicationManagement';
import ComplaintManagement from './pages/panchayat/ComplaintManagement';
import PriceManagement from './pages/panchayat/PriceManagement';
import NoticeManagement from './pages/panchayat/NoticeManagement';
import EventManagement from './pages/panchayat/EventManagement';
import HelplineManagement from './pages/panchayat/HelplineManagement';
import FeedbackManagement from './pages/panchayat/FeedbackManagement';
import MemberManagement from './pages/panchayat/MemberManagement';

// App component orchestrates router configuration and structural view layout
function App() {
  return (
    <Router>
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Publicly accessible routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/mandi" element={<Mandi />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/helpline" element={<Helpline />} />
          <Route path="/members" element={<Members />} />

          {/* Authenticated routes for registered villagers & users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/market" element={<Market />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/complaints" element={<Complaints />} />
          </Route>

          {/* Administrative routes restricted to Panchayat role */}
          <Route element={<PanchayatRoute />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/panchayat/reports" element={<Reports />} />
            <Route path="/panchayat/users" element={<UserManagement />} />
            <Route path="/panchayat/schemes" element={<SchemeManagement />} />
            <Route path="/panchayat/applications" element={<ApplicationManagement />} />
            <Route path="/panchayat/complaints" element={<ComplaintManagement />} />
            <Route path="/panchayat/prices" element={<PriceManagement />} />
            <Route path="/panchayat/notices" element={<NoticeManagement />} />
            <Route path="/panchayat/events" element={<EventManagement />} />
            <Route path="/panchayat/helplines" element={<HelplineManagement />} />
            <Route path="/panchayat/feedback" element={<FeedbackManagement />} />
            <Route path="/panchayat/members" element={<MemberManagement />} />
          </Route>

          {/* Wildcard fallback redirection to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
