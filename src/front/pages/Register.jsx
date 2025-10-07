import React from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { STANDARD_ICON_SIZE } from "../utils/constants";

const Register = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-5 rounded-4" style={{ width: "450px" }}>
                <h1 className="fw-bold text-green mb-4">Sign up</h1>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <div className="position-relative">
                            <User
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                            />
                            <input
                                type="text"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="position-relative">
                            <Mail
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                            />
                            <input
                                type="email"
                                className="form-control ps-5 py-2"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
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
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold p-2"
                    >
                        Sign up
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
