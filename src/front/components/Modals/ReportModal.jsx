import ReactDOM from "react-dom"

const ReportProblemModal = ({ children }) => {
    const portalRoot = document.getElementById("report-portal-root")
    return ReactDOM.createPortal(children, portalRoot)
}

export default ReportProblemModal

