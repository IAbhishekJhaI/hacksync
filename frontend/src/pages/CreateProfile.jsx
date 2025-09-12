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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-xl p-6 shadow-lg rounded-2xl">
        <CardContent>
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold">{steps[step]}</h2>
            <p className="text-sm text-gray-500">
              Step {step + 1} of {steps.length}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Input placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)} />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="rollNo" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Input placeholder="Roll Number"
                  value={formData.rollNo}
                  onChange={(e) => handleChange("rollNo", e.target.value)} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="mail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Input placeholder="Email" type="email"
                  value={formData.mail}
                  onChange={(e) => handleChange("mail", e.target.value)} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Input placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)} />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div>
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
                />
              </motion.div>
            )}


            {step === 5 && (
              <motion.div key="interests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Input placeholder="Interests (comma separated)"
                  onChange={(e) => handleChange(
                    "interests",
                    e.target.value.split(",").map((i) => i.trim())
                  )}
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="visibility" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="flex items-center gap-2">
                  <input type="checkbox"
                    checked={formData.wantToBeFound}
                    onChange={(e) => handleChange("wantToBeFound", e.target.checked)} />
                  <span>Allow others to find me</span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {step > 0 && <Button variant="outline" onClick={prev}>Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
