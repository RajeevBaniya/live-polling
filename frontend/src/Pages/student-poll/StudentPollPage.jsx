import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import "./StudentPollPage.css";
import stopwatch from "../../assets/stopwatch.svg";
import ChatPopover from "../../components/chat/ChatPopover";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/spark.svg";
import { API_BASE_URL } from "../../config";

const socket = io(API_BASE_URL);

const StudentPollPage = () => {
  const [votes, setVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [pollId, setPollId] = useState("");
  const [kickedOut, setKickedOut] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const username = sessionStorage.getItem("username");
      if (username) {
        // Find the selected option object to get its ID
        const selectedOptionObj = pollOptions.find(
          (opt) => opt.text === selectedOption
        );

        socket.emit("submitAnswer", {
          username: username,
          option: selectedOption,
          pollId: pollId,
          optionId: selectedOptionObj ? selectedOptionObj.id : null,
        });
        setSubmitted(true);
      } else {
        console.error("No username found in session storage!");
      }
    }
  };

  useEffect(() => {
    const handleKickedOut = (data) => {
      console.log("Received kickedOut event:", data);
      setKickedOut(true);

      // Clear all session data
      sessionStorage.clear();
      localStorage.removeItem("pollData");

      // Force disconnect from socket
      socket.disconnect();

      // Navigate immediately to the kicked-out page
      window.location.href = "/kicked-out";
    };

    socket.on("kickedOut", handleKickedOut);

    // Also listen for disconnect events which might indicate being kicked
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // The server forced the disconnect
        handleKickedOut({ message: "Server forced disconnect", reason });
      }
    });

    return () => {
      socket.off("kickedOut", handleKickedOut);
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setSubmitted(false);
      setSelectedOption(null);
      setTimeLeft(pollData.timer);
      setPollId(pollData._id);
    });

    socket.on("pollResults", (updatedVotes) => {
      setVotes(updatedVotes);
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, submitted]);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  return (
    <>
      <ChatPopover />
      {kickedOut ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <h3>You've been kicked out!</h3>
            <p>Redirecting to kicked out page...</p>
          </div>
        </div>
      ) : (
        <>
          {" "}
          {pollQuestion === "" && timeLeft === 0 && (
            <div className="d-flex justify-content-center align-items-center vh-100 w-75  mx-auto">
              <div className="student-landing-container text-center">
                <button className="btn btn-sm poll-btn mb-5">
                  <img src={stars} className="px-1" alt="" />
                  Live Poll
                </button>
                <br />
                <div
                  className="spinner-border text-center spinner"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="landing-title">
                  <b>Wait for the teacher to ask questions..</b>
                </h3>
              </div>
            </div>
          )}
          {pollQuestion !== "" && (
            <div className="container mt-5 w-50">
              <div className="d-flex align-items-center mb-4">
                <h5 className="m-0 pe-5">Question</h5>
                <img
                  src={stopwatch}
                  width="15px"
                  height="auto"
                  alt="Stopwatch"
                />
                <span className="ps-2 ml-2 text-danger">{timeLeft}s</span>
              </div>
              <div className="card">
                <div className="card-body">
                  <h6 className="question py-2 ps-2 float-left rounded text-white">
                    {pollQuestion}?
                  </h6>
                  <div className="list-group mt-4">
                    {pollOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`list-group-item rounded m-1 ${
                          selectedOption === option.text
                            ? "border option-border"
                            : ""
                        }`}
                        style={{
                          padding: "10px",
                          cursor:
                            submitted || timeLeft === 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                        onClick={() => {
                          if (!submitted && timeLeft > 0) {
                            handleOptionSelect(option.text);
                          }
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className={`ml-2 text-left ${
                              submitted ? "font-weight-bold" : ""
                            }`}
                          >
                            {option.text}
                          </span>
                          {submitted && (
                            <span className="text-right">
                              {Math.round(
                                calculatePercentage(votes[option.text] || 0)
                              )}
                              %
                            </span>
                          )}
                        </div>
                        {submitted && (
                          <div className="progress mt-2">
                            <div
                              className="progress-bar progress-bar-bg"
                              role="progressbar"
                              style={{
                                width: `${calculatePercentage(
                                  votes[option.text] || 0
                                )}%`,
                              }}
                              aria-valuenow={votes[option.text] || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!submitted && selectedOption && timeLeft > 0 && (
                <div className="d-flex  justify-content-end align-items-center">
                  <button
                    type="submit"
                    className="btn continue-btn my-3 w-25"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              )}

              {submitted && (
                <div className="mt-5">
                  <h6 className="text-center">
                    Wait for the teacher to ask a new question...
                  </h6>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StudentPollPage;
