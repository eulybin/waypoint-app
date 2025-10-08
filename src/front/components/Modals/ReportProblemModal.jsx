import ReactDOM from "react-dom";
import { useState, useRef } from "react";
import { MODAL_BACKGROUND } from "../../utils/constants";

const ReportProblemModal = ({ onClose, onSuccess }) => {
    const [description, setDescription] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleAttachFileOnChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedFile(file);
        }
    }

    const handleSubmitReport = async () => {
        const formData = new FormData();
        formData.append("description", description);
        if (attachedFile) formData.append("attachedFile", attachedFile);
        // await reportProblem(formData);
        onSuccess();
    };

    const portalRoot = document.getElementById("report-portal-root");

    return ReactDOM.createPortal(
        <div className="modal d-block" style={{ backgroundColor: MODAL_BACKGROUND }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Report a problem</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Description</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Please describe the problem..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        {attachedFile && (
                            <div className="small text-body mt-2 ms-1">
                                <strong>Attached:</strong> {attachedFile.name}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0 d-flex align-items-center justify-content-between">
                        <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                            Attach file
                        </button>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={(e) => handleAttachFileOnChange(e)}
                        />
                        <button className="btn bg-green text-white" onClick={handleSubmitReport}>
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default ReportProblemModal;


