import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, CircleAlert } from 'lucide-react';
import { STANDARD_ICON_SIZE, NOT_FOUND_FONT_SIZE } from '../utils/constants';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { actionTypes } from '../store';

const NotFound = () => {

    const { dispatch } = useGlobalReducer();

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleOpenReportModal = () => {
        dispatch({ type: actionTypes.OPEN_REPORT_MODAL });
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-body">
            <div className="text-center px-4">
                <div className="mb-4">
                    <h1 className="display-1 fw-bold text-orange mb-0" style={{ fontSize: NOT_FOUND_FONT_SIZE }}>
                        404
                    </h1>
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <p className="fs-1 text-muted mb-0">Page Not Found</p>
                    </div>
                </div>

                <p className="text-muted mb-4 fs-5">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
                    <button
                        onClick={handleGoBack}
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2"
                    >
                        <ArrowLeft size={STANDARD_ICON_SIZE} />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="btn bg-orange text-white d-flex align-items-center gap-2 px-4 py-2 text-decoration-none"
                    >
                        <Home size={STANDARD_ICON_SIZE} />
                        Go to Home
                    </Link>
                </div>

                <div className="mt-4">
                    <p className="text-muted small">
                        If you believe this is a mistake, please report it{' '}
                        <button
                            onClick={handleOpenReportModal}
                            type='button'
                            className="text-orange text-decoration-none fw-semibold bg-transparent border-0 p-0">
                            here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;