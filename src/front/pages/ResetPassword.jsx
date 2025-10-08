import React from "react";
import { Link } from "react-router-dom";
import { Mail, UserLock } from "lucide-react";
import { STANDARD_ICON_SIZE, HEADER_ICON_SIZE, AUTH_FORM_WIDTH, INPUT_ICON_POSITION, RESET_PASSWORD_HEADER_ICON_DIV_SIZE } from "../utils/constants";

const ResetPassword = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-body">
            <div className="card shadow-lg p-5 rounded-4" style={{ width: AUTH_FORM_WIDTH }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex justify-content-center align-items-center rounded-circle border border-3"
                        style={RESET_PASSWORD_HEADER_ICON_DIV_SIZE}>
                        <UserLock size={HEADER_ICON_SIZE} className="text-body" />
                    </div>
                </div>

                <h1 className="fw-bold text-center mb-3">Forgot your password?</h1>
                <p className="text-center text-muted mb-4">
                    Enter your email address, and we'll send you a link to reset your password.
                </p>

                <form>
                    <div className="mb-3">
                        <div className="position-relative">
                            <Mail
                                className="position-absolute text-muted"
                                size={STANDARD_ICON_SIZE}
                                style={INPUT_ICON_POSITION}
                            />
                            <input
                                type="email"
                                className="form-control ps-5 py-2"
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn bg-orange w-100 text-white fw-semibold py-2 mb-3"
                    >
                        Reset Password
                    </button>
                </form>

                <div className="d-flex align-items-center my-3">
                    <div className="flex-grow-1 border-top"></div>
                    <span className="mx-3 text-muted small">or</span>
                    <div className="flex-grow-1 border-top"></div>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        to="/login"
                        className="text-body fw-semibold text-decoration-none"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div >
    );
}

export default ResetPassword;