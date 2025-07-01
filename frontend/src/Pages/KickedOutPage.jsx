import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import stars from "../assets/spark.svg";

const KickedOutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all session and local storage data
    sessionStorage.clear();
    localStorage.clear();

    // Set a flag in localStorage to indicate this user was kicked
    const kickedUsername = sessionStorage.getItem("username") || "unknown";
    localStorage.setItem(
      "kicked",
      JSON.stringify({
        username: kickedUsername,
        timestamp: new Date().toISOString(),
        isKicked: true,
      })
    );

    // Prevent browser back button from working
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  const handleBackToLogin = () => {
    // Clear the kicked status before returning to login
    localStorage.removeItem("kicked");
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <button className="btn btn-sm poll-btn mb-5">
          <img src={stars} className="px-1" alt="" />
          Live Poll
        </button>
        <h1 className="mb-4">You've been Kicked out!</h1>
        <p className="mb-5">
          Looks like the teacher had removed you from the poll system.
          <br />
          Try again sometime.
        </p>
        <button
          className="btn continue-btn px-4 py-2"
          onClick={handleBackToLogin}
          style={{
            background:
              "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
            color: "white",
            borderRadius: "25px",
            fontSize: "1rem",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default KickedOutPage;
