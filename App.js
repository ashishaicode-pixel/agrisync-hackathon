import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBatch from './pages/CreateBatch';
import BatchDetails from './pages/BatchDetails';
import VerifyBatch from './pages/VerifyBatch';
import Marketplace from './pages/Marketplace';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify/:batchId" element={<VerifyBatch />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-batch"
                  element={
                    <ProtectedRoute>
                      <CreateBatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/batch/:id"
                  element={
                    <ProtectedRoute>
                      <BatchDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <AIChat />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;