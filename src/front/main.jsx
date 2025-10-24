import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

const Main = () => (
    <React.StrictMode>
        <AuthProvider>
            <StoreProvider>
                <RouterProvider router={router} />
            </StoreProvider>
        </AuthProvider>
    </React.StrictMode>
);

root.render(<Main />);

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        root.unmount();
    });
}