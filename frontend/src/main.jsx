// src/main.jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LandingScreen from "./LandingScreen.jsx";

function Root() {
  const [entered, setEntered] = useState(false);

  return entered ? <App /> : <LandingScreen onEnter={() => setEntered(true)} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
