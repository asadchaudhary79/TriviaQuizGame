import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    score = 0,
    totalQuestions = 0,
    answeredQuestions = [],
    playerName = "Anonymous",
  } = location.state || {};
  if (!location.state) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      <h1 className="text-4xl font-bold text-gray-700 mb-8">
        Quiz Results
      </h1>
      <div
        className="bg-white shadow-xl rounded-lg p-10 w-full max-w-2xl text-center border border-gray-200"
        style={{ maxWidth: "64.5%", height: "70%" }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Player: <span className="font-bold text-blue-600">{playerName}</span>
        </h2>
        <p className="text-lg mb-4 font-medium text-gray-700">
          Score: <span className="font-bold">{score}</span>
        </p>
        <h3 className="text-xl mb-6 font-medium text-gray-700">
          {score === totalQuestions
            ? "Perfect Score!"
            : score >= totalQuestions / 2
            ? "Good Job!"
            : "Better Luck Next Time!"}
        </h3>
        {/* <h4 className="text-lg font-medium text-gray-800 mb-4">
          Answered Questions:
        </h4> */}
        <ul className="text-left text-gray-700">
          {answeredQuestions.map((question, index) => (
            <li
              key={index}
              className={`mb-4 p-4 rounded-md ${
                question.isCorrect ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <strong className="block text-gray-800">
                {question.question}
              </strong>
              <div className="mt-1">
                Your answer:{" "}
                <span
                  className={
                    question.isCorrect
                      ? "text-green-900 font-semibold"
                      : "text-red-900 font-semibold"
                  }
                >
                  {question.selectedOption}{" "}
                  {question.isCorrect ? "(Correct)" : "(Wrong)"}
                </span>
              </div>
              {!question.isCorrect && (
                <div className="text-gray-700 text-sm mt-1">
                  Correct answer: {question.correctAnswer}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate("/")}
          className="mt-8 py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg font-medium transition-all"
          aria-label="Restart the quiz"
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
};

export default Result;
