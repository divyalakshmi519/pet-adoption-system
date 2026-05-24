import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import PetListingPage from './pages/PetListingPage';
import PetDetailsPage from './pages/PetDetailsPage';
import AdoptionApplicationPage from './pages/AdoptionApplicationPage';
import ShelterDashboard from './pages/ShelterDashboard';
import ApplicationTrackingPage from './pages/ApplicationTrackingPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pets" element={<PetListingPage />} />
              <Route path="/pets/:id" element={<PetDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/apply/:petId" element={
                <ProtectedRoute>
                  <AdoptionApplicationPage />
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute>
                  <ApplicationTrackingPage />
                </ProtectedRoute>
              } />
              
              <Route path="/shelter-dashboard" element={
                <ProtectedRoute allowedRoles={['shelter_staff', 'admin']}>
                  <ShelterDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;