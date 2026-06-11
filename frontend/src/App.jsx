import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';

// Pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage     from './pages/HomePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — login না করলেই দেখা যাবে */}
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          }/>
          <Route path="/register" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          }/>

          {/* Protected — login লাগবে */}
          <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          }/>

          {/* নতুন routes এখানে যোগ করো */}
          {/* <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          }/> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
