import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-2xl text-center">
        <CardContent>
          <h1 className="text-2xl font-bold mb-6">
            HackSync Teammate Finder
          </h1>
          <p className="mb-6 text-gray-600">
            Choose what you want to do:
          </p>
          <div className="space-y-4">
            <Button className="w-full" onClick={() => navigate("/create-profile")}>
              Create Profile
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate("/find-teammates")}>
              Find Teammates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
