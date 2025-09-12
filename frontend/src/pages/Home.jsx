import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-aqua-400/20 rounded-full blur-2xl animate-ping"></div>
      </div>

      <Card className="relative w-full max-w-md p-8 shadow-2xl rounded-3xl text-center bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500">
        <CardContent>
          <div className="relative mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              HackSync Teammate Finder
            </h1>
            <div className="absolute inset-0 text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent blur-sm opacity-50"></div>
          </div>
          
          <p className="mb-8 text-gray-300 text-lg">
            Choose what you want to do:
          </p>
          
          <div className="space-y-6">
            <Button 
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transform hover:scale-105 transition-all duration-300" 
              onClick={() => navigate("/create-profile")}
            >
              Create Profile
            </Button>
            
            <Button 
              className="w-full py-4 text-lg font-semibold bg-gray-800 hover:bg-gray-700 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transform hover:scale-105 transition-all duration-300" 
              variant="outline" 
              onClick={() => navigate("/find-teammates")}
            >
              Find Teammates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}