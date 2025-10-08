import ReactDOM from "react-dom"

const ThankYouModal = ({ children }) => {
    const portalRoot = document.getElementById("thank-you-portal-root")
    return ReactDOM.createPortal(children, portalRoot)
}

export default ThankYouModal