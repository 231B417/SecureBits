import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CheckoutDemo from './pages/checkout/CheckoutDemo';
import PortalSelect from './pages/PortalSelect';
import UserDashboard from './pages/user/UserDashboard';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalSelect />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<CheckoutDemo />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
