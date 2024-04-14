import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserDashboard from './components/Userdashboard'; // Import the UserDashboard component
import ChatPage from './components/ChatPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/userdashboard" element={<UserDashboard />} /> {/* Add the UserDashboard route */}
        <Route path="/chat/:email" element={<ChatPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
