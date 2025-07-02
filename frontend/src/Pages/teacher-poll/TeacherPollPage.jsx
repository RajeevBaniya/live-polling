import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import ChatPopover from "../../components/chat/ChatPopover";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";
import "./TeacherPollPage.css";
import { API_BASE_URL } from "../../config";

const socket = io(API_BASE_URL);

const TeacherPollPage = () => {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = new useNavigate();
  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setStudentAnswers([]);
    });

    socket.on("pollResults", (updatedVotes) => {
      setVotes(updatedVotes);
      setTotalVotes(Object.values(updatedVotes).reduce((a, b) => a + b, 0));
    });

    socket.on("studentAnswerSubmitted", (studentAnswer) => {
      console.log("Received student answer:", studentAnswer);
      setStudentAnswers((prev) => {
        // Check if this student already answered, if so, replace their answer
        const existingIndex = prev.findIndex(
          (a) => a.username === studentAnswer.username
        );
        if (existingIndex >= 0) {
          const newAnswers = [...prev];
          newAnswers[existingIndex] = studentAnswer;
          return newAnswers;
        } else {
          return [...prev, studentAnswer];
        }
      });
    });

    return () => {
      socket.off("pollCreated");
      socket.off("pollResults");
      socket.off("studentAnswerSubmitted");
    };
  }, []);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };
  const askNewQuestion = () => {
    navigate("/teacher-home-page");
  };
  const handleViewPollHistory = () => {
    navigate("/teacher-poll-history");
  };

  return (
    <>
      <button
        className="btn rounded-pill ask-question poll-history px-4 m-2"
        onClick={handleViewPollHistory}
      >
        <img src={eyeIcon} alt="" />
        View Poll history
      </button>
      <br />
      <div className="container mt-5 w-50">
        <h3 className="mb-4 text-center">Poll Results</h3>

        {pollQuestion && (
          <>
            <div className="card">
              <div className="card-body">
                <h6 className="question py-2 ps-2 text-left rounded text-white">
                  {pollQuestion} ?
                </h6>
                <div className="list-group mt-4">
                  {pollOptions.map((option) => (
                    <div
                      key={option.id}
                      className="list-group-item rounded m-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{option.text}</span>
                        <span>
                          {Math.round(
                            calculatePercentage(votes[option.text] || 0)
                          )}
                          %
                        </span>
                      </div>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button
                className="btn rounded-pill ask-question px-4 m-2"
                onClick={askNewQuestion}
              >
                + Ask a new question
              </button>
              <button
                className="btn rounded-pill toggle-answers-btn px-4 m-2"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? "Hide Student Answers" : "Show Student Answers"}
              </button>
            </div>

            <div
              id="student-answers-section"
              className={`mt-4 ${showAnswers ? "d-block" : "d-none"}`}
            >
              <h4>Student Answers</h4>
              <div className="table-responsive">
                <table className="table table-striped student-answers-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Answer</th>
                      <th>Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAnswers.length > 0 ? (
                      studentAnswers.map((answer, index) => (
                        <tr
                          key={index}
                          className={
                            answer.isCorrect === true
                              ? "correct"
                              : answer.isCorrect === false
                              ? "incorrect"
                              : ""
                          }
                        >
                          <td>{answer.username}</td>
                          <td>{answer.option}</td>
                          <td>
                            {answer.isCorrect === true ? (
                              <span className="correct-answer">✓ Correct</span>
                            ) : (
                              <span className="incorrect-answer">
                                ✗ Incorrect
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No student answers yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!pollQuestion && (
          <div className="text-muted">
            Waiting for the teacher to start a new poll...
          </div>
        )}
        <ChatPopover />
      </div>
    </>
  );
};

export default TeacherPollPage;
