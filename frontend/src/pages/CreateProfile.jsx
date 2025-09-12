import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const steps = [
  "Name", "Roll Number", "Email", "Phone Number",
  "Skills", "Interests", "Visibility"
];

export default function CreateProfile() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "", rollNo: "", mail: "", phoneNumber: "",
    skills: { beginner: [], intermediate: [], advanced: [] },
    interests: [], wantToBeFound: true
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSkillChange = (level, value) =>
    setFormData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [level]: value.split(",").map((s) => s.trim()) },
    }));

  const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    setStep((prev) => prev + 1);
  }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Profile created successfully!");
      } else {
        alert("Error creating profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <Card className="relative w-full max-w-2xl p-8 shadow-2xl rounded-3xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-500">
        <CardContent>
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index <= step
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 shadow-sm shadow-cyan-500/50"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{steps[step]}</h2>
            <p className="text-gray-400">
              Step {step + 1} of {steps.length}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="name" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Input 
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="rollNo" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Input 
                  placeholder="Roll Number"
                  value={formData.rollNo}
                  onChange={(e) => handleChange("rollNo", e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="mail" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Input 
                  placeholder="Email" 
                  type="email"
                  value={formData.mail}
                  onKeyDown={handleKeyPress}
                  onChange={(e) => handleChange("mail", e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="phone" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Input 
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="skills" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="mb-4">
                  <p className="text-gray-300 mb-3">Describe your skills and expertise level:</p>
                  <Input
                    placeholder="I know Java a little, C++ quite well, and amazing at Python"
                    onBlur={async (e) => {
                      const res = await fetch("http://localhost:3000/api/parse-skills", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: e.target.value }),
                      });
                      const parsed = await res.json();
                      setFormData((prev) => ({ ...prev, skills: parsed }));
                    }}
                    onKeyDown={handleKeyPress}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                  />
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="interests" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Input 
                  placeholder="Interests (comma separated)"
                  onChange={(e) => handleChange(
                    "interests",
                    e.target.value.split(",").map((i) => i.trim())
                  )}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/30 h-14 text-lg"
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div 
                key="visibility" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="bg-gray-700/30 p-6 rounded-2xl border border-gray-600">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.wantToBeFound}
                      onChange={(e) => handleChange("wantToBeFound", e.target.checked)}
                      className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <span className="text-white text-lg">Allow others to find me</span>
                  </label>
                  <p className="text-gray-400 text-sm mt-2 ml-9">
                    This will make your profile visible to others looking for teammates
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 0 && (
              <Button 
                variant="outline" 
                onClick={prev}
                className="px-8 py-3 text-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300"
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button 
                onClick={next}
                className={`px-8 py-3 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 ${
                  step === 0 ? 'ml-auto' : ''
                }`}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/40 transition-all duration-300"
              >
                Submit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}