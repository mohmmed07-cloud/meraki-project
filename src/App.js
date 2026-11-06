import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './Pages/NavbarFooter/Navbar';
import Footer from './Pages/NavbarFooter/Footer';
import Home from './Pages/Home';
import ScrollToTop from './ScrollToTop';
import Applications from './Pages/Applications';
import Motions from './Pages/Motions';
import Contact from './Pages/Contact';
import Admin from './Pages/Admin';
import Inbox from './Pages/Inbox';
import Login from './Pages/Login';
import AddMotionAdmin from './Pages/AddMotionAdmin';
import ProtectedRoute from './Pages/ProtectedRoute';

import './App.css'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* المكان الصحيح لمكون التمرير التلقائي */}
        <ScrollToTop />
        <div className="App">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/motions" element={<Motions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="/inbox" element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            } />
            
            <Route path="/add-motion" element={
              <ProtectedRoute>
                <AddMotionAdmin />
              </ProtectedRoute>
            } />
          </Routes>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;