import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FaLongArrowAltRight } from "react-icons/fa";

const CircularTimer = ({ timer, isTimerEnded }) => {
  const radius = 25;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timer / 20) * circumference;

  return (
    <svg width="60" height="60" style={{ transform: "rotate(-80deg)" }}>
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke="gray"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke={isTimerEnded ? "red" : "black"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 1s ",
        }}
      />
      <text
        x="30"
        y="36"
        textAnchor="middle"
        fontSize="16"
        fill="black"
        style={{ transform: "rotate(80deg)", transformOrigin: "center" }}
      >
        {timer}
      </text>
    </svg>
  );
};

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timerEnded, setTimerEnded] = useState(false);
  const [scoreUpdateColor, setScoreUpdateColor] = useState("text-gray-700");

  const shakeAnimation = {
    hidden: { x: 0 },
    visible: { x: [0, -5, 5, -5, 0], transition: { duration: 0.5 } },
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (gameStarted && timer > 0 && !isAnswered) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      setTimerEnded(true);
      setIsAnswered(true);
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
        setTimer(20);
        setTimerEnded(false);
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

      let scoreForQuestion = 400;
      if (timer > 5) {
        scoreForQuestion += (timer - 5) * 40;
      } else if (timer <= 5) {
        scoreForQuestion -= (5 - timer) * 40;
      }

      scoreForQuestion = Math.max(scoreForQuestion, 0);

      if (isCorrect) {
        setScore((prevScore) => prevScore + scoreForQuestion);
        setScoreUpdateColor("text-green-500");
      } else {
        setScoreUpdateColor("text-red-500");
      }

      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: question.question,
          selectedOption,
          isCorrect,
          correctAnswer: question.correctAnswer,
          score: scoreForQuestion,
        },
      ]);

      setIsAnswered(true);
      setQuestionsRemaining((prev) => prev - 1);
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

      setTimeout(() => {
        setScoreUpdateColor("text-gray-700");
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (questionsRemaining > 0) {
      loadQuestion();
    } else {
      setGameEnded(true);
    }
  };

const handleStartGame = () => {
  let valid = true;

  // Log the current values for debugging
  console.log("Player Name:", playerName);
  console.log("Selected Category:", selectedCategory);
  console.log("Number of Questions:", numQuestions);

  if (playerName.trim() === "") {
    setErrorMessage("Please enter your name.");
    valid = false;
  } else if (selectedCategory === "") {
    setErrorMessage("Please select a category.");
    valid = false;
  } else if (numQuestions <= 0 || isNaN(numQuestions)) {
    setErrorMessage("Please select a valid number of questions.");
    valid = false;
  } else if (numQuestions > 50) {
    // Assuming a maximum of 50 questions
    setErrorMessage("Please select a number of questions up to 50.");
    valid = false;
  }

  if (valid) {
    setErrorMessage(""); // Clear error if valid
    setScore(0);
    setQuestionsRemaining(numQuestions);
    setGameStarted(true);
    setAnsweredQuestions([]);
  }
};



  const handleFirstQuestion = () => {
    loadQuestion(); // This will now load the first question
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
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestionsRemaining(numQuestions);
    setAnsweredQuestions([]);
    setTimer(10);
    setTimerEnded(false);
    setScoreUpdateColor("text-gray-700");
  };

  const getRemarks = () => {
    if (score === numQuestions * 400) return "Perfect score!";
    if (score >= (numQuestions * 400) / 2) return "Good job!";
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

  useEffect(() => {
    if (gameStarted) {
      loadQuestion();
    }
  }, [gameStarted, selectedCategory, difficulty, numQuestions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!gameStarted ? (
        <div
          className="bg-black-700 shadow-lg px-5 form-body-custom rounded-lg p-8 w-full max-w-xl text-center border border-gray-200"
          style={{ height: "80%" }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quiz Game</h1>
          <div>
            <div className="mb-4 flex items-center input-field-adjustment flex-col md:flex-row justify-between">
              <label className="text-lg font-medium text-gray-700 start-label-custom text-start my-3">
                Enter Your Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className=" px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                placeholder="Your Name"
              />
            </div>
            <div className="mb-4 input-field-adjustment  flex items-center flex-col md:flex-row justify-between">
              <label className="text-lg font-medium text-gray-700 start-label-custom text-start my-3">
                Select Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              >
                <option value="">Choose Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 input-field-adjustment flex items-center flex-col md:flex-row justify-between">
              <label className="text-lg font-medium text-gray-700 start-label-custom text-start my-3">
                Select Difficulty:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300 m-0"
                style={{ width: "70%" }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="mb-4 input-field-adjustment flex items-center flex-col md:flex-row justify-between">
              <label className="text-lg font-medium text-gray-700 start-label-custom text-start my-3">
                No of Questions:
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) =>
                  setNumQuestions(Math.max(1, Number(e.target.value)))
                }
                min="1"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                style={{ width: "70%" }}
              />
            </div>
            {errorMessage && (
              <div className="text-red-500 mb-4">{errorMessage}</div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  console.log("Player Name:", playerName);
                  console.log("Selected Category:", selectedCategory);
                  console.log("Number of Questions:", numQuestions);
                  handleStartGame();
                }}
                className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                disabled={!selectedCategory || playerName.trim() === ""}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Trivia Quiz Game
          </h1>
          <div
            className="bg-white shadow-lg rounded-lg w-full max-w-xl relative border border-gray-200 mx-auto w-full"
            style={{ maxWidth: "65%" }}
          >
            <div className="">
              <div
                className={`text-lg flex items-center border-2 border-black-500 justify-between p-2 px-7 ${scoreUpdateColor}`}
                style={{ gap: "20px" }}
              >
                <h6 className="text-slate-800 font-medium">Trivia Quiz Game</h6>
                <div className="flex items-center ml-auto">
                  <CircularTimer timer={timer} isTimerEnded={timerEnded} />
                  <span className="ml-4">Score: {score}</span>
                  <h2 className="text-xl font-semibold text-gray-700 mb-0 ml-4">
                    {currentQuestionIndex} of {numQuestions}
                  </h2>
                </div>
              </div>

              {question && (
                <div className="p-10">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4 p-4">
                    {question.question}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((option, index) => {
                      const isCorrect = option === question.correctAnswer;
                      const isSelected =
                        isAnswered &&
                        option ===
                          answeredQuestions.find(
                            (q) => q.question === question.question
                          )?.selectedOption;

                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          animate={
                            isAnswered && (isCorrect || isSelected)
                              ? shakeAnimation.visible
                              : {}
                          }
                          initial={isAnswered ? shakeAnimation.hidden : {}}
                          transition={{ duration: 0.5 }}
                          className={`py-2 px-4 border rounded-lg text-lg transition-colors ${
                            isAnswered
                              ? isCorrect
                                ? "border-2 border-green-500 text-green-500"
                                : isSelected
                                ? "border-2 border-red-500 text-red-500"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          disabled={isAnswered}
                        >
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
              {(timerEnded || isAnswered) && !gameEnded && (
                <div className="my-4 mb-6 flex justify-center">
                  <button
                    onClick={handleNextQuestion}
                    className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-2 flex items-center"
                    style={{ gap: "10px" }}
                  >
                    Next Question{" "}
                    <FaLongArrowAltRight style={{ marginTop: "3px" }} />
                  </button>
                </div>
              )}
            </div>
          </div>
          {gameEnded && (
            <div
              className="mt-6 absolute bg-white border-2 border-gray-200 rounded-lg w-full flex flex-col justify-center items-center"
              style={{ maxWidth: "63.5%", height: "80%" }}
            >
              <h2 className="text-2xl font-semibold">
                Your Score: {score} / {numQuestions * 400}
              </h2>
              <h3 className="text-lg">{getRemarks()}</h3>
              <div
                style={{ width: "100px", height: "100px", marginTop: "20px" }}
              >
                <CircularProgressbar
                  value={(score / (numQuestions * 400)) * 100}
                  styles={buildStyles({
                    strokeLinecap: "round",
                    pathColor: `#3b82f6`,
                    trailColor: "#d6d6d6",
                  })}
                />
                <svg
                  width="100"
                  height="100"
                  style={{ position: "absolute", top: "38%", left: "48%" }}
                >
                  <text
                    x="20"
                    y="50"
                    textAnchor="middle"
                    fontSize="16"
                    fill="black"
                    className="custom-text"
                    style={{
                      transform: "rotate(0deg)",
                      transformOrigin: "center",
                    }}
                  >
                    {`${Math.round((score / (numQuestions * 400)) * 100)}%`}
                  </text>
                </svg>
              </div>

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

          {!gameEnded && !timerEnded && (
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
