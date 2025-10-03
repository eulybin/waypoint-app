import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "400px" }}>
                <h2 className="fw-bold text-green mb-4">Log in</h2>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Email or username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                        />
                        <div className="text-end mt-1">
                            <a href="#" className="small text-green">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold"
                    >
                        Log in
                    </button>
                </form>

                <div className="d-flex align-items-center my-3">
                    <div className="flex-grow-1 border-top"></div>
                    <span className="mx-2 text-muted small">or</span>
                    <div className="flex-grow-1 border-top"></div>
                </div>



                <div className="text-center medium">
                    <Link to="/register" className="text-orange text-decoration-none">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login
