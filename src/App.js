import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Immeubles from './pages/Immeubles';
import Studios from './pages/Studios';
import Locataires from './pages/Locataires';
import Paiements from './pages/Paiements';
import Eau from './pages/Eau';
import Depenses from './pages/Depenses';
import Rapports from './pages/Rapports';
import Profil from './pages/Profil';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/immeubles" element={<PrivateRoute><Layout><Immeubles /></Layout></PrivateRoute>} />
          <Route path="/studios" element={<PrivateRoute><Layout><Studios /></Layout></PrivateRoute>} />
          <Route path="/locataires" element={<PrivateRoute><Layout><Locataires /></Layout></PrivateRoute>} />
          <Route path="/paiements" element={<PrivateRoute><Layout><Paiements /></Layout></PrivateRoute>} />
          <Route path="/eau" element={<PrivateRoute><Layout><Eau /></Layout></PrivateRoute>} />
          <Route path="/depenses" element={<PrivateRoute><Layout><Depenses /></Layout></PrivateRoute>} />
          <Route path="/rapports" element={<PrivateRoute><Layout><Rapports /></Layout></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><Layout><Profil /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;