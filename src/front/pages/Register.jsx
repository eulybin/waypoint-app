import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeClosed } from "lucide-react";
import { STANDARD_ICON_SIZE, AUTH_FORM_WIDTH, INPUT_ICON_POSITION, HIDE_OR_SHOW_PASSWORD_ICON_SIZE } from "../utils/constants";
import useAuth from "../hooks/useAuth"

const initialSignUpFormState = {
    name: "",
    email: "",
    password: ""

}

const Register = () => {

    const { registerUser } = useAuth()

    const [signUpData, setSignUpData] = useState(initialSignUpFormState);
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const abortControllerRef = useRef(null)

    const navigate = useNavigate()

    const handleInputOnChange = (e) => {
        setSignUpData(prevState => {
            return { ...prevState, [e.target.name]: e.target.value }
        })
        setErrorMessage("")
    }

    const handleRegisterUser = async (e) => {
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
            const result = await registerUser(signUpData, controller.signal)
            if (result?.success) {
                setSignUpData(initialSignUpFormState)
                navigate("/login")
            } else {
                setErrorMessage(result?.error || "Failed to sign up, please try again.")
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Registration failed: ", error)
                setErrorMessage("Failed to sign up, please try again.")
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
                <h1 className="fw-bold text-green mb-4">Sign up</h1>

                <form onSubmit={handleRegisterUser}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <div className="position-relative">
                            <User
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={INPUT_ICON_POSITION}
                            />
                            <input
                                type="text"
                                name="name"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your name"
                                value={signUpData.name}
                                onChange={handleInputOnChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="position-relative">
                            <Mail
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={INPUT_ICON_POSITION}
                            />
                            <input
                                type="email"
                                name="email"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your email"
                                value={signUpData.email}
                                onChange={handleInputOnChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
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
                                placeholder="Create a password"
                                value={signUpData.password}
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
                    </div>

                    {errorMessage && <p className="text-danger small">{errorMessage}</p>}

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold p-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing up..." : "Sign up"}
                    </button>
                </form>

                <div className="d-flex align-items-center my-3">
                    <div className="flex-grow-1 border-top"></div>
                    <span className="mx-2 text-muted small">or</span>
                    <div className="flex-grow-1 border-top"></div>
                </div>

                <p className="text-center small text-muted">
                    Already have an account? &nbsp;
                    <Link
                        to="/login"
                        className="text-orange fw-semibold text-decoration-none"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
