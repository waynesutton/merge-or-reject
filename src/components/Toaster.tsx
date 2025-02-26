/**
 * Toaster.tsx
 *
 * This component provides toast notifications for the application.
 * It wraps the react-toastify ToastContainer with appropriate styling.
 *
 * Changes made:
 * - Created new Toaster component
 * - Configured with dark theme and custom positioning
 */

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toaster: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  );
};

export default Toaster;
