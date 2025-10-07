import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, PlusCircle, Compass, User, TrendingUp, Star, Menu, Sun, Moon, Flag, LogOut, MapPinPlus } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer"
import { actionTypes } from "../store";
import { NAVBAR_ICON_SIZE, STANDARD_ICON_SIZE, NAVBAR_WIDTH, NAVBAR_CHILD_DIV_WIDTH, CREATE_ROUTE_FONT_SIZE, MODAL_BACKGROUND } from "../utils/constants";
import ReportProblemModal from "./Modals/ReportModal";

const Navbar = () => {

	// ------------------------------
	// -------- NAVBAR LOGIC --------
	// ------------------------------

	const { store, dispatch } = useGlobalReducer()

	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [showAppearance, setShowAppearance] = useState(false)

	const navbarItems = [
		{ icon: Home, label: "Home", path: "/" },
		// { icon: PlusCircle, label: "Create Route", path: "/create-route" },
		{ icon: Compass, label: "Explore", path: "/explore" },
		{ icon: TrendingUp, label: "Trending", path: "/trending" },
		{ icon: Star, label: "Popular", path: "/top" },
		{ icon: User, label: "Profile", path: "/profile" },
	];

	const handleShowAppearance = () => {
		setShowAppearance(prevState => !prevState)
		setShowMoreMenu(false)
	}

	const handleCloseAppearance = () => {
		setShowAppearance(false)
		setShowMoreMenu(false)
	}

	// ------------------------------
	// ----- REPORT MODAL LOGIC -----
	// ------------------------------

	const attachFileInputRef = useRef(null);

	const [showReportModal, setShowReportModal] = useState(false)
	const [description, setDescription] = useState("")
	const [attachedFile, setAttachedFile] = useState(null)

	const handleCloseReportModal = () => {
		setShowReportModal(false)
		setDescription("")
		setAttachedFile(null)
	}

	const handleSubmitReport = async () => {
		const formData = new FormData()
		formData.append("description", description)
		if (attachedFile) {
			formData.append("attachedFile", attachedFile)
		}
		// --- NEED TO WRITE THIS SERVICE ---
		// EXAMPLE: await sendProblemReport()
		handleCloseReportModal()
	}

	return (
		<div className="d-flex flex-column bg-body border-end vh-100 position-fixed" style={{ width: NAVBAR_WIDTH, zIndex: 1000 }}>

			<div className="p-4">
				<Link to="/" className="text-decoration-none">
					<h3 className="fw-bold text-body mt-4 ms-2">Waypoint</h3>
				</Link>
			</div>

			<nav className="flex-grow-1 p-3">
				{navbarItems.map((item, index) => (
					<Link
						key={index}
						to={item.path}
						className="d-flex align-items-center gap-3 text-decoration-none text-body p-3 rounded-3 mb-2 sidebar-item"
					>
						<item.icon size={NAVBAR_ICON_SIZE} />
						<span className="fw-semibold">{item.label}</span>
					</Link>
				))}

				<div className="position-relative rounded-3">
					<button
						onClick={() => setShowMoreMenu(prevState => !prevState)}
						className="d-flex align-items-center gap-3 text-body p-3 rounded-3 w-100 border-0 bg-transparent sidebar-item"
					>
						<Menu size={24} />
						<span className="fw-semibold">More</span>
					</button>

					<Link
						to="/create-route"
						className="btn bg-green text-white w-100 rounded-3 fw-bold py-3 mt-3 d-flex align-items-center justify-content-center gap-2"
						style={{ fontSize: CREATE_ROUTE_FONT_SIZE }}
					>
						<MapPinPlus size={NAVBAR_ICON_SIZE} />
						Create Route
					</Link>

					{showMoreMenu && (
						<div className="position-absolute bottom-100 start-0 bg-body border rounded-3 shadow-lg mb-2" style={{ width: NAVBAR_CHILD_DIV_WIDTH }}>
							<button
								onClick={handleShowAppearance}
								className="d-flex align-items-center gap-3 text-body p-3 border-bottom w-100 border-0 bg-transparent text-start sidebar-item rounded-top-3"
							>
								<Sun size={STANDARD_ICON_SIZE} />
								<span>Appearance</span>
							</button>
							<button
								onClick={() => setShowReportModal(true)}
								className="d-flex align-items-center gap-3 text-body p-3 border-bottom w-100 border-0 bg-transparent text-start sidebar-item"

							>
								<Flag size={STANDARD_ICON_SIZE} />
								<span>Report a Problem</span>
							</button>
							<button
								className="d-flex align-items-center gap-3 text-body p-3 w-100 border-0 bg-transparent text-start logout-item rounded-bottom-3"
								onClick={() => {/* Add logout logic */ }}
							>
								<LogOut size={STANDARD_ICON_SIZE} />
								<span>Logout</span>
							</button>
						</div>
					)}
					{showAppearance && (
						<div className="position-absolute bottom-100 start-0 bg-body border rounded-3 shadow-lg mb-2" style={{ width: NAVBAR_CHILD_DIV_WIDTH }}>
							<div className="p-3">
								<div className="d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center gap-2">
										{store.isDarkMode ? <Moon size={STANDARD_ICON_SIZE} /> : <Sun size={STANDARD_ICON_SIZE} />}
										<span>Dark Mode</span>
									</div>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											checked={store.isDarkMode}
											onChange={() => dispatch({ type: actionTypes.TOGGLE_DARK_MODE })}
										/>
									</div>
								</div>
							</div>
							<div className="p-2 border-top">
								<button
									onClick={handleCloseAppearance}
									className="btn btn-sm text-muted w-100"
								>
									Close
								</button>
							</div>
						</div>
					)}

					<ReportProblemModal>
						{showReportModal && (
							<div className="modal d-block" style={{ backgroundColor: MODAL_BACKGROUND }}>
								<div className="modal-dialog modal-dialog-centered">
									<div className="modal-content rounded-4">
										<div className="modal-header border-0 pb-0">
											<h5 className="modal-title fw-bold">Report a problem</h5>
											<button
												type="button"
												className="btn-close"
												onClick={handleCloseReportModal}
											></button>
										</div>

										<div className="modal-body">
											<div className="mb-3">
												<label className="form-label fw-semibold">Description</label>
												<textarea
													onChange={(e) => setDescription(e.target.value)}
													value={description}
													className="form-control"
													rows="4"
													placeholder="Please describe the problem..."
												></textarea>
											</div>
											{attachedFile && (
												<div className="small text-body mt-2 ms-1">
													<strong>Attached:</strong> {attachedFile.name}
												</div>
											)}
										</div>

										<div className="modal-footer border-0 d-flex align-items-center justify-content-between">
											<button
												type="button"
												className="btn btn-secondary"
												onClick={() => attachFileInputRef.current.click()}
											>
												Attach file
											</button>
											<input
												type="file"
												accept="image/*,application/pdf"
												style={{ display: "none" }}
												ref={attachFileInputRef}
												onChange={(e) => {
													const file = e.target.files[0];
													if (file) {
														setAttachedFile(file);
													}
												}}
											/>
											<button
												type="button"
												className="btn bg-green text-white"
												onClick={handleSubmitReport}
											>
												Submit
											</button>
										</div>
									</div>
								</div>
							</div>
						)}


					</ReportProblemModal>
				</div>
			</nav >
		</div >
	);
};

export default Navbar;