import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error upon typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      // Redirect to login with success flash
      navigate('/login', {
        state: { registered: 'Account created successfully! You may now sign in with your credentials.' },
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 text-center">
              <div
                className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-person-plus-fill fs-4"></i>
              </div>
              <h4 className="fw-bold mb-1">Create Student Account</h4>
              <p className="text-white-50 small mb-0">Join QuizMaster to take timed assessments and track your mastery</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  icon={<i className="bi bi-person"></i>}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  icon={<i className="bi bi-envelope"></i>}
                  required
                />

                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      error={fieldErrors.password}
                      icon={<i className="bi bi-lock"></i>}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirm_password"
                      placeholder="Repeat password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      error={fieldErrors.confirm_password}
                      icon={<i className="bi bi-shield-check"></i>}
                      required
                    />
                  </div>
                </div>

                <div className="text-muted small mb-4">
                  <i className="bi bi-shield-lock me-1"></i> Passwords are encrypted using industry-standard scrypt hashing.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2.5 shadow-sm"
                  loading={loading}
                >
                  Create Account
                </Button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Already registered? </span>
                <Link to="/login" className="fw-semibold text-primary text-decoration-none small">
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
