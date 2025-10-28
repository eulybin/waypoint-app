import useGlobalReducer from "../../hooks/useGlobalReducer";
import { actionTypes } from "../../store";
import ReportProblemModal from "../Modals/ReportProblemModal";
import ThankYouModal from "../Modals/ThankYouModal";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
      {store.showReportModal && (
        <ReportProblemModal
          onClose={() => dispatch({ type: actionTypes.CLOSE_REPORT_MODAL })}
          onSuccess={() => {
            dispatch({ type: actionTypes.CLOSE_REPORT_MODAL });
            dispatch({ type: actionTypes.OPEN_THANK_YOU_MODAL });
          }}
        />
      )}
      {store.showThankYouModal && (
        <ThankYouModal onClose={() => dispatch({ type: actionTypes.CLOSE_THANK_YOU_MODAL })} />
      )}
    </>
  );
};

export default Navbar;
