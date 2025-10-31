import { useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { actionTypes } from "../../store";
import ReportProblemModal from "../Modals/ReportProblemModal";
import ThankYouModal from "../Modals/ThankYouModal";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import CompactHorizontalNavbar from "./CompactHorizontalNavbar";

const VerticalNavbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  return (
    <>
      {/* All navbars render, CSS handles visibility */}
      <DesktopNavbar
        showMoreMenu={showMoreMenu}
        setShowMoreMenu={setShowMoreMenu}
        showAppearance={showAppearance && !showMoreMenu}
        setShowAppearance={setShowAppearance}
      />
      <MobileNavbar
        showMoreMenu={showMoreMenu}
        showAppearance={showAppearance}
        setShowMoreMenu={setShowMoreMenu}
        setShowAppearance={setShowAppearance}
      />
      <CompactHorizontalNavbar />
      
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

export default VerticalNavbar;
