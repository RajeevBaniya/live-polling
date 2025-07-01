import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import { useNavigate } from "react-router-dom";
import "./StudentLandingPage.css";

const StudentLandingPage = () => {
  let navigate = new useNavigate();

  const [name, setName] = useState(null);
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
      <div className="text-center" style={{ maxWidth: "800px" }}>
        <button className="btn btn-sm poll-btn mb-3">
          <img src={stars} className="px-1" alt="" />
          Live Poll
        </button>
        <h2 className="landing-title mb-3">Let's Get Started</h2>
        <p className="landing-description">
          If you're a student, you'll be able to{" "}
          <span className="text-dark fw-bold">submit your answers</span>,
          participate in live polls, and see how your responses compare with
          your classmates
        </p>
        <form onSubmit={handleStudentLogin} className="mt-4">
          <div className="mx-auto" style={{ maxWidth: "400px" }}>
            <label className="d-block text-start mb-2">Enter your Name</label>
            <input
              type="text"
              className="form-control mb-4 name-input"
              required
              style={{ maxWidth: "400px" }}
              onChange={(e) => setName(e.target.value)}
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
