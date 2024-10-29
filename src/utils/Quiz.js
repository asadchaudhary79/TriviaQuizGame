// src/Quiz.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Quiz = () => {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionsRemaining, setQuestionsRemaining] = useState(numQuestions);
  const [gameEnded, setGameEnded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // New state for answered questions
  const [showResults, setShowResults] = useState(false); // New state for showing results

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (gameStarted && timer > 0 && !isAnswered) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      setIsAnswered(true);
      setTimeout(handleNextQuestion, 1000);
    }
  }, [timer, gameStarted, isAnswered]);

  useEffect(() => {
    if (questionsRemaining === 0) {
      setGameEnded(true);
      setShowModal(true); // Show modal when game ends
    }
  }, [questionsRemaining]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        "https://the-trivia-api.com/api/categories"
      );
      setCategories(Object.keys(response.data));
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const loadQuestion = async () => {
    if (selectedCategory && questionsRemaining > 0) {
      try {
        const response = await axios.get(
          `https://the-trivia-api.com/api/questions?categories=${selectedCategory}&difficulty=${difficulty}&limit=1`
        );
        const fetchedQuestion = response.data[0];

        setQuestion(fetchedQuestion);
        setOptions(
          shuffleOptions([
            ...fetchedQuestion.incorrectAnswers,
            fetchedQuestion.correctAnswer,
          ])
        );
        setIsAnswered(false);
        setTimer(10);
        setQuestionsRemaining(questionsRemaining - 1);
      } catch (error) {
        console.error("Error fetching question", error);
      }
    }
  };

  const shuffleOptions = (optionsArray) =>
    optionsArray.sort(() => Math.random() - 0.5);

  const handleOptionClick = (selectedOption) => {
    if (!isAnswered) {
      const isCorrect = selectedOption === question.correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }

      // Save the answered question
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: question.question,
          selectedOption,
          isCorrect,
        },
      ]);

      setIsAnswered(true);
      setTimeout(handleNextQuestion, 1000);
    }
  };

  const handleNextQuestion = () => {
    loadQuestion();
    if (questionsRemaining === 1) {
      setGameEnded(true);
      setShowModal(true); // Show modal when the game ends
    }
  };

  const handleStartGame = () => {
    setQuestionsRemaining(numQuestions);
    setGameStarted(true);
    setAnsweredQuestions([]); // Reset answered questions
    loadQuestion();
  };

  const getRemarks = () => {
    if (score === numQuestions) return "Perfect score!";
    if (score >= numQuestions / 2) return "Good job!";
    return "Better luck next time!";
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowResults(false); // Reset results visibility
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!gameStarted ? (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Trivia Quiz Game
          </h1>
          <div className="mb-4">
            <label className="text-lg font-medium text-gray-700">
              Enter Your Name:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="ml-2 px-4 py-2 border rounded-lg"
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label className="text-lg font-medium text-gray-700">
              Select Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ml-2 px-4 py-2 border rounded-lg"
            >
              <option value="">Choose Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-lg font-medium text-gray-700">
              Select Difficulty:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="ml-2 px-4 py-2 border rounded-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-lg font-medium text-gray-700">
              Number of Questions:
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, e.target.value))}
              min="1"
              className="ml-2 px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleStartGame}
            className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors mt-4"
            disabled={!selectedCategory || playerName.trim() === ""}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Trivia Quiz Game
          </h1>
          <div className="bg-white shadow-lg rounded-lg w-full max-w-xl relative">
            {/* Timer Progress Bar on Top */}
            <div
              className="absolute top-0 left-0 h-2"
              style={{
                width: `${(timer / 10) * 100}%`,
                backgroundColor: timer > 5 ? "green" : "red",
                transition: "width 1s ease-in-out",
              }}
            ></div>

            <div className="p-8">
              {question && (
                <>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {question.question}
                  </h2>
                  <div className="grid gap-4 mb-6">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className={`py-2 px-4 rounded-lg font-medium text-gray-700 border ${
                          isAnswered && option === question.correctAnswer
                            ? "bg-green-400 text-white"
                            : "bg-blue-200 hover:bg-blue-300"
                        } ${
                          isAnswered && option !== question.correctAnswer
                            ? "bg-red-400 text-white"
                            : ""
                        }`}
                        disabled={isAnswered}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Timer Progress Bar on Bottom */}
            <div
              className="absolute bottom-0 left-0 h-2"
              style={{
                width: `${(timer / 10) * 100}%`,
                backgroundColor: timer > 5 ? "green" : "red",
                transition: "width 1s ease-in-out",
              }}
            ></div>
          </div>

          <div className="mt-4 text-lg text-gray-700">
            Score: <span className="font-semibold">{score}</span>
          </div>

          <div className="mt-4 text-lg text-gray-700">
            Time Left: <span className="font-semibold">{timer} seconds</span>
          </div>

          <div className="mt-4 text-lg text-gray-700">
            Player: <span className="font-semibold">{playerName}</span>
          </div>

          <div className="mt-4 text-lg text-gray-700">
            Questions Remaining:{" "}
            <span className="font-semibold">{questionsRemaining}</span>
          </div>

          {gameEnded && showModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
              onClick={handleModalClose}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                <p>
                  Your Score: <span className="font-semibold">{score}</span>
                </p>
                <p>{getRemarks()}</p>
                <button
                  onClick={handleModalClose}
                  className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowResults(true)} // Show results
                  className="mt-4 py-2 px-4 bg-gray-500 text-white rounded-lg"
                >
                  View Results
                </button>
              </div>
            </div>
          )}

          {showResults && (
            <div className="bg-white shadow-lg rounded-lg w-full max-w-xl p-6 mt-4">
              <h2 className="text-2xl font-bold mb-4">
                Results for {playerName}
              </h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {answeredQuestions.map((q, index) => (
                    <tr
                      key={index}
                      className={q.isCorrect ? "bg-green-100" : "bg-red-100"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {q.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {q.selectedOption}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {q.isCorrect ? "Correct" : "Wrong"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
