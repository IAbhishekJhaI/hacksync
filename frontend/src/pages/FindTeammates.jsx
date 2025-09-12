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

  const questions = [
    {
      label: "What skills do you have? (comma-separated)",
      key: "mySkills",
      placeholder: "e.g. React, Node.js, Python",
    },
    {
      label: "What are your interests? (comma-separated)",
      key: "myInterests",
      placeholder: "e.g. AI, Research, Business",
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
    try {
      const params = new URLSearchParams(formData).toString();
      const res = await fetch(`http://localhost:3000/api/users/find-teammates?${params}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching teammates:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100">
      {results.length === 0 ? (
        <Card className="w-full max-w-xl p-6 shadow-lg rounded-2xl bg-white/70 backdrop-blur">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {questions[step].label}
            </h2>
            <Input
              type="text"
              placeholder={questions[step].placeholder}
              value={formData[questions[step].key]}
              onChange={(e) =>
                setFormData({ ...formData, [questions[step].key]: e.target.value })
              }
              className="mb-6"
            />
            <div className="flex justify-between">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext}>
                {step === questions.length - 1 ? "Find Teammates" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Potential Teammates
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((match, i) => (
              <Card key={i} className="p-4 bg-white/80 backdrop-blur">
                <CardContent>
                  <h3 className="text-lg font-semibold">{match.teammate.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Roll No: {match.teammate.rollNo}
                  </p>
                  <p className="mb-2 text-gray-700">Skills:</p>
                  <div className="flex flex-wrap">
                    {Object.entries(match.teammate.skills || {}).flatMap(
                      ([level, skills]) =>
                        skills.map((s, idx) => (
                          <Tag key={`${level}-${idx}`}>{s}</Tag>
                        ))
                    )}
                  </div>
                  <p className="mt-3 mb-2 text-gray-700">Interests:</p>
                  <div className="flex flex-wrap">
                    {(match.teammate.interests || []).map((interest, idx) => (
                      <Tag key={idx} className="bg-green-100 text-green-700">
                        {interest}
                      </Tag>
                    ))}
                  </div>
                  <p className="mt-4 font-medium text-blue-600">
                    Match Score: {match.matchScore}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
