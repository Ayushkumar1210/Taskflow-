import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Whiteboard from './pages/Whiteboard';
import AIChatbot from './components/AIChatbot';
import VoiceCommandController from './components/VoiceCommandController';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore((state) => state.token);
  return token ? (
    <>
      {children}
      <AIChatbot />
      <VoiceCommandController />
    </>
  ) : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        } />
        <Route path="/whiteboard" element={
          <PrivateRoute>
            <Whiteboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
