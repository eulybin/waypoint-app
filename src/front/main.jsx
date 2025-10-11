import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from "./hooks/useGlobalReducer";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

const Main = () => (
    <React.StrictMode>
        <StoreProvider>
            <RouterProvider router={router} />
        </StoreProvider>
    </React.StrictMode>
);

root.render(<Main />);

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        root.unmount();
    });
}
