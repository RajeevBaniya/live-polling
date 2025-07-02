import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import "./TeacherLandingPage.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";
import { API_BASE_URL } from "../../config";

const socket = io(API_BASE_URL);

const TeacherLandingPage = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([{ id: 1, text: "", correct: null }]);
  const [timer, setTimer] = useState("60");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleTimerChange = (e) => {
    setTimer(e.target.value);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = value;
    setOptions(updatedOptions);
  };

  const handleCorrectToggle = (index, isCorrect) => {
    const updatedOptions = [...options];
    updatedOptions[index].correct = isCorrect;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: options.length + 1, text: "", correct: null },
    ]);
  };

  const validateForm = () => {
    if (question.trim() === "") {
      setError("Question cannot be empty");
      return false;
    }

    if (options.length < 2) {
      setError("At least two options are required");
      return false;
    }

    const optionTexts = options.map((option) => option.text.trim());
    if (optionTexts.some((text) => text === "")) {
      setError("All options must have text");
      return false;
    }

    const correctOptionExists = options.some(
      (option) => option.correct === true
    );
    if (!correctOptionExists) {
      setError("At least one correct option must be selected");
      return false;
    }

    setError("");
    return true;
  };

  const askQuestion = () => {
    if (validateForm()) {
      let teacherUsername = sessionStorage.getItem("username");
      let pollData = { question, options, timer, teacherUsername };
      socket.emit("createPoll", pollData);
      navigate("/teacher-poll");
    }
  };
  const handleViewPollHistory = () => {
    navigate("/teacher-poll-history");
  };

  return (
    <div className="page-container">
      <div className="poll-header">
        <button className="btn history-btn" onClick={handleViewPollHistory}>
          <img src={eyeIcon} alt="View History Icon" />
          <span>View Poll history</span>
        </button>
      </div>

      <div className="container my-4">
        <button className="btn poll-btn mb-3">
          <img src={stars} alt="Poll Icon" />
          <span>Live Poll</span>
        </button>

        <h2 className="fw-bold">Let's Get Started</h2>
        <p>
          <b>Teacher: </b>
          {username}
        </p>
        <p className="text-muted">
          You'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-5 position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label htmlFor="question" className="form-label fs-5 mb-0">
              Enter your question
            </label>
            <select
              className="timer-select"
              value={timer}
              onChange={handleTimerChange}
            >
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
            </select>
          </div>
          <textarea
            id="question"
            className="form-control"
            onChange={handleQuestionChange}
            maxLength="100"
            placeholder="Type your question..."
            rows="3"
          ></textarea>
          <div className="character-count">{question.length}/100</div>
        </div>

        <div className="mb-4">
          <div className="options-header">
            <label className="form-label">Edit Options</label>
          </div>
          {options.map((option, index) => (
            <div key={option.id} className="option-container">
              <span className="sNo">{index + 1}</span>
              <div className="option-input-container">
                <input
                  type="text"
                  className="option-input"
                  placeholder="Option text..."
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <div className="radio-group">
                  <span>Is it correct?</span>
                  <div className="radio-options">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id={`yes-${index}`}
                        name={`correct-${index}`}
                        checked={option.correct === true}
                        onChange={() => handleCorrectToggle(index, true)}
                        required="required"
                      />
                      <label htmlFor={`yes-${index}`}>Yes</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id={`no-${index}`}
                        name={`correct-${index}`}
                        checked={option.correct === false}
                        onChange={() => handleCorrectToggle(index, false)}
                        required="required"
                      />
                      <label htmlFor={`no-${index}`}>No</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn add-options" onClick={addOption}>
          + Add More option
        </button>

        <div className="button-container">
          <button
            className="btn ask-question"
            onClick={askQuestion}
            disabled={!question.trim() || options.length < 2}
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLandingPage;
