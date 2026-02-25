import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from 'react-toastify';
// We'll create these page components next
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Notifications from './pages/Notifications';

import React from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/*" element={
          <PrivateRoute>
            <>
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Feed feedType="all" />} />
                  <Route path="/following" element={<Feed feedType="following" />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/:username" element={<Profile />} />
                  <Route path="/:username/status/:postId" element={<PostDetail />} />
                </Routes>
              </main>
            </>
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer theme="dark" position="bottom-center" />
    </div>
  );
}

export default App;
