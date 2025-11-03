import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeClosed } from 'lucide-react';
import {
  STANDARD_ICON_SIZE,
  AUTH_FORM_WIDTH,
  INPUT_ICON_POSITION,
  HIDE_OR_SHOW_PASSWORD_ICON_SIZE,
} from '../utils/constants';
import useAuth from '../hooks/useAuth';
import LoadingButton from '../components/LoadingButton';

const initialLoginFormState = {
  email: '',
  password: '',
};

const Login = () => {
  const { loginUser } = useAuth();

  const [loginData, setLoginData] = useState(initialLoginFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const abortControllerRef = useRef(null);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Please enter your email';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email';
    } else {
      return null;
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Please enter your password';
    } else {
      return null;
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputOnChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prevState) => ({ ...prevState, [name]: value }));
    setServerError('');
    setValidationErrors((prevState) => ({ ...prevState, [name]: null }));
  };

  const handleLoginUser = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSubmitting(true);
    setServerError('');

    try {
      const result = await loginUser(loginData, controller.signal);
      if (result?.success) {
        setLoginData(initialLoginFormState);
        navigate('/');
      } else {
        setServerError(result?.error || 'Failed to log in, please try again.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Login failed: ', error);
        setServerError('Failed to log in, please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-body">
      <div className="card shadow-lg p-5 rounded-4" style={{ width: AUTH_FORM_WIDTH }}>
        <h1 className="fw-bold text-green mb-4">Log in</h1>

        <form onSubmit={handleLoginUser}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="position-relative">
              <input
                id="email"
                type="email"
                name="email"
                className={`form-control ps-5 py-2 custom-input ${validationErrors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleInputOnChange}
                onFocus={() => setValidationErrors((prevState) => ({ ...prevState, email: null }))}
                disabled={isSubmitting}
              />
              <Mail
                className="position-absolute text-muted"
                size={STANDARD_ICON_SIZE}
                style={INPUT_ICON_POSITION}
                aria-hidden="true"
              />
              {validationErrors.email && (
                <div className="invalid-feedback d-block">
                  {validationErrors.email}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="position-relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-control ps-5 py-2 custom-input ${validationErrors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleInputOnChange}
                onFocus={() => setValidationErrors((prevState) => ({ ...prevState, password: null }))}
                disabled={isSubmitting}
              />
              <div
                onClick={() => !isSubmitting && setShowPassword((prevState) => !prevState)}
                className="password-toggle position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                role="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeClosed size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} aria-hidden="true" />
                ) : (
                  <Eye size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} aria-hidden="true" />
                )}
              </div>
              <Lock
                className="position-absolute text-muted"
                size={STANDARD_ICON_SIZE}
                style={INPUT_ICON_POSITION}
                aria-hidden="true"
              />
              {validationErrors.password && (
                <div className="invalid-feedback d-block">
                  {validationErrors.password}
                </div>
              )}
            </div>
          </div>

          {serverError && <p className="text-danger small">{serverError}</p>}
          <LoadingButton
            type="submit"
            className="btn bg-orange w-100 text-white fw-semibold p-2"
            isLoading={isSubmitting}
            loadingText="Logging in..."
          >
            Log in
          </LoadingButton>
        </form>

        <div className="d-flex align-items-center my-3">
          <div className="flex-grow-1 border-top"></div>
          <span className="mx-2 text-muted small">or</span>
          <div className="flex-grow-1 border-top"></div>
        </div>

        <p className="text-center small text-muted">
          Don't have an account? &nbsp;
          <Link to="/register" className="text-orange fw-semibold text-decoration-none">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
