import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import { useNavigate } from "react-router-dom";
import "./StudentLandingPage.css";

const StudentLandingPage = () => {
  let navigate = new useNavigate();

  const [name, setName] = useState("");
  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (name?.trim()) {
      try {
        sessionStorage.setItem("username", name);
        navigate("/poll-question");
      } catch (error) {
        console.error("Error logging in student:", error);
        alert("Error connecting to the server. Please try again.");
      }
    } else {
      alert("Please enter your name");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="landing-container text-center">
        <button className="btn poll-btn mb-4">
          <img src={stars} alt="Live Poll Icon" width="16" height="16" />
          <span>Live Poll</span>
        </button>
        <h2 className="landing-title mb-3">Let's Get Started</h2>
        <p className="landing-description mb-4">
          If you're a student, you'll be able to{" "}
          <span className="text-dark fw-bold">submit your answers</span>,
          participate in live polls, and see how your responses compare with
          your classmates
        </p>
        <form onSubmit={handleStudentLogin} className="mt-4">
          <div className="form-container">
            <label htmlFor="name-input" className="name-label">
              Enter your Name
            </label>
            <input
              id="name-input"
              type="text"
              className="form-control mb-4 name-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name here"
            />
            <button type="submit" className="btn continue-btn">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLandingPage;
