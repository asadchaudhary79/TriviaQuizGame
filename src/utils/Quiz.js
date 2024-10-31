import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (gameStarted && timer > 0 && !isAnswered) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      setIsAnswered(true);
      handleAnswer("");
    }
  }, [timer, gameStarted, isAnswered]);

  useEffect(() => {
    if (questionsRemaining === 0) {
      setGameEnded(true);
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
            fetchedQuestion.correctAnswer,
            ...fetchedQuestion.incorrectAnswers,
          ])
        );
        setIsAnswered(false);
        setTimer(10);
      } catch (error) {
        console.error("Error fetching question", error);
      }
    }
  };

  const shuffleOptions = (optionsArray) =>
    optionsArray.sort(() => Math.random() - 0.5);

  const handleAnswer = (selectedOption) => {
    if (!isAnswered) {
      const isCorrect = selectedOption === question.correctAnswer;

      if (isCorrect) {
        setScore(score + 1);
      }

      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: question.question,
          selectedOption,
          isCorrect,
          correctAnswer: question.correctAnswer,
        },
      ]);

      setIsAnswered(true);
      setQuestionsRemaining((prev) => prev - 1);
      if (questionsRemaining === 1) {
        setGameEnded(true);
      } else {
        setTimeout(loadQuestion, 1000);
      }
    }
  };

  const handleStartGame = () => {
    let valid = true;

    if (playerName.trim() === "") {
      setErrorMessage("Please enter your name.");
      valid = false;
    } else if (selectedCategory === "") {
      setErrorMessage("Please select a category.");
      valid = false;
    } else if (numQuestions <= 0 || isNaN(numQuestions)) {
      setErrorMessage("Please select a valid number of questions.");
      valid = false;
    }

    if (valid) {
      setErrorMessage("");
      setScore(0);
      setQuestionsRemaining(numQuestions);
      setGameStarted(true);
      setAnsweredQuestions([]);
      loadQuestion();
    }
  };

  const handleStopGame = () => {
    setGameEnded(true);
    navigate("/results", {
      state: {
        score,
        totalQuestions: numQuestions,
        answeredQuestions,
        playerName,
      },
    });
  };

  const handleRestartGame = () => {
    setGameEnded(false);
    setGameStarted(false);
    setPlayerName("");
    setSelectedCategory("");
    setNumQuestions(5);
    setErrorMessage("");
  };

  const getRemarks = () => {
    if (score === numQuestions) return "Perfect score!";
    if (score >= numQuestions / 2) return "Good job!";
    return "Better luck next time!";
  };

  const handleViewResults = () => {
    navigate("/results", {
      state: {
        score,
        totalQuestions: numQuestions,
        answeredQuestions,
        playerName,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!gameStarted ? (
        <div className="bg-black-700 shadow-lg rounded-lg p-8 w-full max-w-xl text-center border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Trivia Quiz Game
          </h1>
          <div>
            <div className="mb-4">
              <label className="text-lg font-medium text-gray-700">
                Enter Your Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300 "
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
                className="ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
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
                className="ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
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
                onChange={(e) =>
                  setNumQuestions(Math.max(1, Number(e.target.value)))
                }
                min="1"
                className="ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              />
            </div>
            {errorMessage && (
              <div className="text-red-500 mb-4">{errorMessage}</div>
            )}
            <button
              onClick={handleStartGame}
              className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors mt-4"
              disabled={!selectedCategory || playerName.trim() === ""}
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Trivia Quiz Game
          </h1>
          <div className="bg-white shadow-lg rounded-lg w-full max-w-xl relative border border-gray-200">
            <div
              className="absolute top-0 left-0 h-1"
              style={{
                width: `${(timer / 10) * 100}%`,
                backgroundColor: timer > 5 ? "green" : "red",
                transition: "width 1s ease-in-out",
              }}
            ></div>

            <div className="p-8">
              {question && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    {question.question}
                  </h2>
                  <div className="grid gap-4">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`py-2 px-4 border rounded-lg text-lg transition-colors ${
                          isAnswered
                            ? option === question.correctAnswer
                              ? "bg-green-400 text-white"
                              : "bg-red-400 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } ${
                          isAnswered &&
                          option !== question.correctAnswer &&
                          option ===
                            answeredQuestions.find(
                              (q) => q.question === question.question
                            )?.selectedOption
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
          </div>
          {gameEnded && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold">
                Your Score: {score} / {numQuestions}
              </h2>
              <h3 className="text-lg">{getRemarks()}</h3>
              <button
                onClick={handleViewResults}
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4"
              >
                View Results
              </button>
              <button
                onClick={handleRestartGame}
                className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg mt-4 ml-2"
              >
                Restart Game
              </button>
            </div>
          )}
          {!gameEnded && (
            <button
              onClick={handleStopGame}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg mt-4"
            >
              Stop Game
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
