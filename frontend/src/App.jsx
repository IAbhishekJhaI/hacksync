import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateProfile from "./pages/CreateProfile";
import FindTeammates from "./pages/FindTeammates";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/find-teammates" element={<FindTeammates />} />
      </Routes>
    </Router>
  );
}
