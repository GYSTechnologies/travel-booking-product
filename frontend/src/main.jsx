import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SuperAdminProvider } from "./contexts/SuperAdminContext.jsx"; // ✅ import it

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SuperAdminProvider> {/* ✅ Wrap this first */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </SuperAdminProvider>
  </BrowserRouter>
);
