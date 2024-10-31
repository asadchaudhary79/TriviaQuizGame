import React from "react";
import { Route, Routes } from "react-router-dom";
import Quiz from "./utils/Quiz"; 
import Result from "./utils/Result";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Quiz />} />
      <Route path="/results" element={<Result />} />
    </Routes>
  );
};

export default App;
