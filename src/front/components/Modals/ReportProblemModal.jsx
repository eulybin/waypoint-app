import ReactDOM from "react-dom";
import { useState, useRef, useEffect } from "react";
import { MODAL_BACKGROUND } from "../../utils/constants";
import { reportProblem } from "../../services/reportProblemService";

const ReportProblemModal = ({ onClose, onSuccess }) => {
    const [description, setDescription] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const handleAttachFileOnChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile(file);
        }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const formData = new FormData();
        formData.append("description", description);
        if (attachedFile) {
            formData.append("attachedFile", attachedFile);
        }

        setIsSubmitting(true);
        setErrorMessage("");
        try {
            await reportProblem(formData, controller.signal);
            setDescription("");
            setAttachedFile(null);
            setErrorMessage("");
            onSuccess();
        } catch (error) {
            if (error.name !== "AbortError") {
                setErrorMessage("Failed to send report, please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const portalRoot = document.getElementById("report-portal-root");

    return ReactDOM.createPortal(
        <div className="modal d-block" style={{ backgroundColor: MODAL_BACKGROUND }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <div className="modal-header border-0 pb-1">
                        <h5 className="modal-title fw-bold">Report a problem</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmitReport}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Please describe the problem..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    minLength={10}
                                />
                            </div>

                            {errorMessage && <span className="text-danger small ms-1">{errorMessage}</span>}

                            {attachedFile && (
                                <div className="small text-body mt-2 ms-1">
                                    <strong>Attached:</strong> {attachedFile.name}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer pt-0 border-0 d-flex align-items-center justify-content-between">
                            <button disabled={isSubmitting} type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                                Attach file
                            </button>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                style={{ display: "none" }}
                                ref={fileInputRef}
                                onChange={(e) => handleAttachFileOnChange(e)}
                            />
                            <button type="submit" className="btn bg-green text-white" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default ReportProblemModal;


