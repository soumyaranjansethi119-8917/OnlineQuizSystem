import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Success message after registration redirect
  const registeredSuccess = location.state?.registered;
  const expiredMessage = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 text-center">
              <div
                className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-mortarboard-fill fs-4"></i>
              </div>
              <h4 className="fw-bold mb-1">Welcome to QuizMaster</h4>
              <p className="text-white-50 small mb-0">Sign in to your student or administrator account</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {registeredSuccess && (
                <Alert variant="success" className="mb-4">
                  {registeredSuccess}
                </Alert>
              )}

              {expiredMessage && (
                <Alert variant="warning" className="mb-4">
                  Your session has expired. Please sign in again.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<i className="bi bi-envelope"></i>}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<i className="bi bi-lock"></i>}
                  required
                  autoComplete="current-password"
                />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                    <label className="form-check-label small text-muted" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <span className="text-muted small">Secure authentication</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2.5 shadow-sm"
                  loading={loading}
                >
                  Sign In
                </Button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Don't have an account yet? </span>
                <Link to="/register" className="fw-semibold text-primary text-decoration-none small">
                  Create Student Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
