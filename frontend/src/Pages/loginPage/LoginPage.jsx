import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const selectRole = (role) => {
    setSelectedRole(role);
  };

  const continueToPoll = async () => {
    if (selectedRole === "teacher") {
      try {
        let teacherlogin = await axios.post(`${API_BASE_URL}/teacher-login`);
        sessionStorage.setItem("username", teacherlogin.data.username);
        navigate("/teacher-home-page");
      } catch (error) {
        console.error("Error logging in teacher:", error);
        alert("Error connecting to the server. Please try again.");
      }
    } else if (selectedRole === "student") {
      navigate("/student-home-page");
    } else {
      alert("Please select a role to continue.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="poll-container text-center">
        <div className="top-section">
          <button className="btn poll-btn">
            <img src={stars} alt="Live Poll Icon" />
            <span>Live Poll</span>
          </button>
        </div>

        <div className="content-section">
          <h1 className="poll-title">Welcome to the Live Polling System</h1>

          <p className="poll-description">
            Please select the role that best describes you to begin using the
            live polling system
          </p>

          <div className="role-cards">
            <div
              className={`role-btn ${
                selectedRole === "student" ? "active" : ""
              }`}
              onClick={() => selectRole("student")}
              role="button"
              tabIndex={0}
            >
              <p>I'm a Student</p>
              <span>
                Submit answers and participate in live polls to engage with your
                class.
              </span>
            </div>

            <div
              className={`role-btn ${
                selectedRole === "teacher" ? "active" : ""
              }`}
              onClick={() => selectRole("teacher")}
              role="button"
              tabIndex={0}
            >
              <p>I'm a Teacher</p>
              <span>
                Create polls and view live results in real-time to track student
                engagement.
              </span>
            </div>
          </div>

          <button
            className="btn continue-btn"
            onClick={() => {
              if (!selectedRole) {
                alert("Please select a role to continue.");
                return;
              }
              continueToPoll();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
