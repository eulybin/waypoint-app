import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "400px" }}>
                <h2 className="fw-bold text-green mb-4">Sign up</h2>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold"
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
