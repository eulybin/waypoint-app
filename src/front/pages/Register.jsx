import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeClosed } from 'lucide-react';
import {
  STANDARD_ICON_SIZE,
  AUTH_FORM_WIDTH,
  INPUT_ICON_POSITION,
  HIDE_OR_SHOW_PASSWORD_ICON_SIZE,
} from '../utils/constants';
import useAuth from '../hooks/useAuth';
import LoadingButton from '../components/LoadingButton';

const initialSignUpFormState = {
  name: '',
  email: '',
  password: '',
};

const Register = () => {
  const { registerUser } = useAuth();

  const [signUpData, setSignUpData] = useState(initialSignUpFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const abortControllerRef = useRef(null);

  const navigate = useNavigate();

  const validateName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Please enter your full name';
    } else if (trimmedName.length < 2) {
      return 'Name must be at least 2 characters long';
    } else {
      return null;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Please enter your email';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email';
    } else {
      return null;
    }
  };

  const validatePassword = (password) => {
    const passwordRegexObj = {
      lowerCaseRegex: /(?=.*[a-z])/,
      upperCaseRegex: /(?=.*[A-Z])/,
      numberRegex: /(?=.*\d)/,
    };

    if (!password) {
      return 'Please enter your password';
    } else if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    } else if (!passwordRegexObj.lowerCaseRegex.test(password)) {
      return 'Password must contain a lowercase letter';
    } else if (!passwordRegexObj.upperCaseRegex.test(password)) {
      return 'Password must contain an uppercase letter';
    } else if (!passwordRegexObj.numberRegex.test(password)) {
      return 'Password must contain a number';
    } else {
      return null;
    }
  };

  const validateRegisterForm = () => {
    const errors = {};

    const nameError = validateName(signUpData.name);
    const emailError = validateEmail(signUpData.email);
    const passwordError = validatePassword(signUpData.password);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputOnChange = (e) => {
    const { name, value } = e.target;

    setSignUpData(prevState => ({ ...prevState, [name]: value }));

    setServerError("");
    setValidationErrors(prevState => ({ ...prevState, [name]: null }));
  };



  const handleRegisterUser = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSubmitting(true);
    setServerError("");

    try {
      const result = await registerUser(signUpData, controller.signal);
      if (result?.success) {
        setSignUpData(initialSignUpFormState);
        navigate('/login');
      } else {
        const error = result?.error || 'Failed to sign up, please try again.';
        setServerError(error);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Registration failed: ', error);
        setServerError('Failed to sign up, please try again.');
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
        <h1 className="fw-bold text-green mb-4">Sign up</h1>

        <form onSubmit={handleRegisterUser}>
          <div className="mb-3">
            <label htmlFor='name' className="form-label">Full Name</label>
            <div className="position-relative">
              <input
                id='name'
                type="text"
                name="name"
                className={`form-control ps-5 py-2 custom-input ${validationErrors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your name"
                value={signUpData.name}
                onChange={handleInputOnChange}
                disabled={isSubmitting}
              />
              <User
                className="position-absolute text-muted"
                size={STANDARD_ICON_SIZE}
                style={INPUT_ICON_POSITION}
                aria-hidden="true"
              />
              {validationErrors.name && (
                <div className="invalid-feedback d-block">
                  {validationErrors.name}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor='email' className="form-label">Email</label>
            <div className="position-relative">
              <input
                id='email'
                type="email"
                name="email"
                className={`form-control ps-5 py-2 custom-input ${validationErrors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={signUpData.email}
                onChange={handleInputOnChange}
                disabled={isSubmitting}
              />
              <Mail className="position-absolute text-muted"
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
                placeholder="Create a password"
                value={signUpData.password}
                onChange={handleInputOnChange}
                disabled={isSubmitting}
              />
              <div
                onClick={() => setShowPassword((prevState) => !prevState)}
                className="password-toggle position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting}
                role='button'
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
            type='submit'
            className={"btn bg-orange w-100 text-white fw-semibold p-2"}
            isLoading={isSubmitting}
            loadingText={"Signing up..."}
          >
            Sign up
          </LoadingButton>
        </form>

        <div className="d-flex align-items-center my-3">
          <div className="flex-grow-1 border-top"></div>
          <span className="mx-2 text-muted small">or</span>
          <div className="flex-grow-1 border-top"></div>
        </div>

        <p className="text-center small text-muted">
          Already have an account? &nbsp;
          <Link to="/login" className="text-orange fw-semibold text-decoration-none">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;