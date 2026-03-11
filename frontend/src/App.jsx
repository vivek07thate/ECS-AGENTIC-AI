import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadEvidence from './pages/UploadEvidence';
import EvidenceReview from './pages/EvidenceReview';
import Controls from './pages/Controls';
import Login from './pages/Login';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            <Route path="upload-evidence" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UploadEvidence />
              </ProtectedRoute>
            } />
            
            <Route path="evidence-review" element={<EvidenceReview />} />
            <Route path="controls" element={<Controls />} />
            <Route path="audit-reports" element={<div className="p-8 text-center text-gray-500">Audit Reports coming soon...</div>} />
            <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
