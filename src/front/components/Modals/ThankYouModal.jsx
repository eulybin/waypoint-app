import ReactDOM from "react-dom";
import { CircleCheck } from "lucide-react";
import { CHECKMARK_HEADER_ICON_SIZE, MODAL_BACKGROUND } from "../../utils/constants";

const ThankYouModal = ({ onClose }) => {
    const portalRoot = document.getElementById("thank-you-portal-root");

    return ReactDOM.createPortal(
        <div className="modal d-block" style={{ backgroundColor: MODAL_BACKGROUND }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <div className="modal-header border-0 pb-2">
                        <button type="button" className="btn-close ms-auto" onClick={onClose}></button>
                    </div>

                    <div className="modal-body text-center py-4">
                        <CircleCheck className="text-green" size={CHECKMARK_HEADER_ICON_SIZE} />
                        <h2 className="fw-bold mb-3 display-6 mt-3">Thank you!</h2>
                        <p className="text-muted mb-0">
                            Your report has been submitted successfully. We'll get back to you soon.
                        </p>
                    </div>

                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <button className="btn btn-secondary text-white px-4" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default ThankYouModal;

