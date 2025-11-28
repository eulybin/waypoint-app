import { MapPin } from 'lucide-react';
import { STANDARD_ICON_SIZE } from '../utils/constants';
import edinburghImg from '../assets/cities/edinburgh.jpg';

const AuthLayout = ({ children, image, cityLabel }) => {
    return (
        <div className="container py-5 min-vh-100 d-flex align-items-center justify-content-center">
            <div className="w-100" style={{ maxWidth: 980 }}>
                <div className="row g-3 align-items-stretch">
                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="position-relative h-100 rounded-4 overflow-hidden">
                            <div
                                className="auth-left h-100 w-100"
                                style={{ backgroundImage: `url(${image || edinburghImg})` }}
                            />
                            <div className="auth-left-overlay" />
                            <div
                                className="position-absolute bottom-0 start-0 end-0 text-white w-100"
                                style={{
                                    background:
                                        'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 80%)',
                                }}
                            >
                                <div className="ps-2 pe-3 py-3 text-start">
                                    <h3 className="mb-0 d-flex align-items-center">
                                        <MapPin size={STANDARD_ICON_SIZE} className="me-2" aria-hidden="true" />
                                        {cityLabel || 'Edinburgh, Scotland'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 d-flex align-items-center justify-content-center">
                        <div className="bg-body rounded-4 shadow-lg d-lg-flex h-100 w-100 mx-auto" style={{ maxWidth: 420 }}>
                            <div className="p-5 w-100">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
