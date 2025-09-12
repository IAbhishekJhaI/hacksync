import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tag } from "../components/ui/tag";

export default function FindTeammates() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    mySkills: "",
    myInterests: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const questions = [
    {
      label: "What skills do you have?",
      key: "mySkills",
      placeholder: "e.g. React, Node.js, Python, Machine Learning, UI/UX",
      description: "List your technical and non-technical skills separated by commas"
    },
    {
      label: "What are your interests?",
      key: "myInterests", 
      placeholder: "e.g. AI, Research, Business, Web Development, Mobile Apps",
      description: "What domains or areas are you passionate about?"
    },
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get current user email from localStorage if available
      const currentUserEmail = localStorage.getItem('userEmail') || '';
      
      const params = new URLSearchParams({
        ...formData,
        currentUserEmail
      }).toString();
      
      const res = await fetch(`http://localhost:3000/api/users/find-teammates?${params}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setResults(data);
      
      if (data.length === 0) {
        setError("No teammates found matching your criteria. Try broadening your search terms.");
      }
    } catch (err) {
      console.error("Error fetching teammates:", err);
      setError("Failed to find teammates. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "from-emerald-500 to-green-500";
    if (score >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreTextColor = (score) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {results.length === 0 && !loading ? (
        <Card className="relative w-full max-w-2xl p-8 shadow-2xl rounded-3xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-500">
          <CardContent>
            {/* Progress indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index <= step
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/50'
                        : 'bg-gray-600'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {questions[step].label}
              </h2>
              <p className="text-gray-400 mb-2">
                Step {step + 1} of {questions.length}
              </p>
              <p className="text-gray-500 text-sm">
                {questions[step].description}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-center">{error}</p>
              </div>
            )}

            <Input
              type="text"
              placeholder={questions[step].placeholder}
              value={formData[questions[step].key]}
              onChange={(e) =>
                setFormData({ ...formData, [questions[step].key]: e.target.value })
              }
              className="mb-8 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
              disabled={loading}
            />

            <div className="flex justify-between">
              {step > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="px-8 py-3 text-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={loading || !formData[questions[step].key].trim()}
                className={`px-8 py-3 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  step === 0 ? 'ml-auto' : ''
                }`}
              >
                {loading ? "Searching..." : (step === questions.length - 1 ? "Find Teammates" : "Next")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg">Finding your perfect teammates...</p>
        </div>
      ) : (
        <div className="relative w-full max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Potential Teammates
            </h2>
            <p className="text-gray-400 text-lg">Found {results.length} potential matches</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Matches are ranked by complementarity (how well your skills complement each other), 
                 shared interests, and skill overlap</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((match, i) => (
              <Card 
                key={i} 
                className="group p-6 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:scale-105"
              >
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {match.teammate.name}
                    </h3>
                    <p className="text-cyan-400 font-medium">
                      Roll No: {match.teammate.rollNo}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {match.teammate.mail}
                    </p>
                  </div>

                  {/* Match Score Section */}
                  <div className="mb-6 p-4 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 font-medium">Overall Match</span>
                      <span className={`font-bold text-lg ${getScoreTextColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getScoreColor(match.matchScore)} transition-all duration-1000 ease-out`}
                        style={{ width: `${match.matchScore}%` }}
                      ></div>
                    </div>
                    
                    {/* Score Breakdown */}
                    {match.breakdown && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Skill Synergy:</span>
                          <span className="text-cyan-300">{match.breakdown.complementarity}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shared Interests:</span>
                          <span className="text-teal-300">{match.breakdown.interests}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Common Skills:</span>
                          <span className="text-blue-300">{match.breakdown.skillOverlap}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 font-medium mb-3">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(match.teammate.skills || {}).flatMap(
                        ([level, skills]) =>
                          skills.map((skill, idx) => (
                            <Tag 
                              key={`${level}-${idx}`} 
                              className={`text-xs ${
                                level === 'advanced' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                  : level === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {skill}
                              <span className="ml-1 opacity-70">
                                {level === 'advanced' ? '★★★' : level === 'intermediate' ? '★★' : '★'}
                              </span>
                            </Tag>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 font-medium mb-3">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {(match.teammate.interests || []).map((interest, idx) => (
                        <Tag 
                          key={idx} 
                          className="bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-colors duration-200 text-xs"
                        >
                          {interest}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {match.teammate.phoneNumber && (
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">
                        Contact: {match.teammate.phoneNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              onClick={() => {
                setResults([]);
                setStep(0);
                setFormData({ mySkills: "", myInterests: "" });
                setError("");
              }}
              className="px-8 py-3 text-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300"
              variant="outline"
            >
              Search Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}