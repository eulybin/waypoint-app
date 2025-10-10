import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeClosed } from "lucide-react";
import { STANDARD_ICON_SIZE, AUTH_FORM_WIDTH, INPUT_ICON_POSITION, HIDE_OR_SHOW_PASSWORD_ICON_SIZE } from "../utils/constants";
import { loginUser } from "../services/loginUserService";

const initialLoginFormState = {
    email: "",
    password: ""
}

const Login = () => {

    const [loginData, setLoginData] = useState(initialLoginFormState)
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const abortControllerRef = useRef(null)

    const navigate = useNavigate()

    const handleInputOnChange = (e) => {
        setLoginData(prevState => {
            return { ...prevState, [e.target.name]: e.target.value }
        })
        setErrorMessage("")
    }

    const handleLoginUser = async (e) => {
        e.preventDefault()

        //SET-UP INPUT VALIDATION HERE:
        //.......

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        setIsSubmitting(true)

        try {
            await loginUser(loginData, controller.signal)
            setLoginData(initialLoginFormState)
            navigate("/")
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Login failed: ", error)
                setErrorMessage("Failed to log in, please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-body">
            <div className="card shadow-lg p-5 rounded-4" style={{ width: AUTH_FORM_WIDTH }}>
                <h1 className="fw-bold text-green mb-4">Log in</h1>

                <form onSubmit={handleLoginUser}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="position-relative">
                            <Mail
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={INPUT_ICON_POSITION}
                            />
                            <input
                                type="text"
                                name="email"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your email"
                                value={loginData.email}
                                onChange={handleInputOnChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="position-relative">
                            <Lock
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={INPUT_ICON_POSITION}
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleInputOnChange}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(prevState => !prevState)}
                                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                role="button"
                            >
                                {showPassword ? <EyeClosed size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} /> : <Eye size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} />
                                }
                            </div>
                        </div>
                        <div className="text-end mt-1">
                            <Link to="/reset-password" className="small text-green text-decoration-none fw-semibold">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {errorMessage && <p className="text-danger small">{errorMessage}</p>}

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold p-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <div className="d-flex align-items-center my-3">
                    <div className="flex-grow-1 border-top"></div>
                    <span className="mx-2 text-muted small">or</span>
                    <div className="flex-grow-1 border-top"></div>
                </div>

                <p className="text-center small text-muted">
                    Don't have an account? &nbsp;
                    <Link
                        to="/register"
                        className="text-orange fw-semibold text-decoration-none"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
