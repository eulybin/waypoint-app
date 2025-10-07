import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { STANDARD_ICON_SIZE } from "../utils/constants";

const Login = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-5 rounded-4" style={{ width: "450px" }}>
                <h1 className="fw-bold text-green mb-4">Log in</h1>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Email or username</label>
                        <div className="position-relative">
                            <Mail
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                            />
                            <input
                                type="text"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="position-relative">
                            <Lock
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                            />
                            <input
                                type="password"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="text-end mt-1">
                            <Link to="/reset-password" className="small text-green text-decoration-none fw-semibold">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold p-2"
                    >
                        Log in
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
