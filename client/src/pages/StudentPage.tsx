import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  BarChart3, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  StarIcon
} from "lucide-react";
import { useLocation } from "wouter";

export function StudentPage() {
  const [, setLocation] = useLocation();
  const socket = useSocket("student");
  
  const [name, setName] = useState(() => {
    return sessionStorage.getItem("studentName") || "";
  });
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (socket.student) {
      setHasJoined(true);
      sessionStorage.setItem("studentName", socket.student.name);
    }
  }, [socket.student]);

  useEffect(() => {
    if (socket.activeQuestion?.endTime) {
      const endTime = new Date(socket.activeQuestion.endTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [socket.activeQuestion]);

  useEffect(() => {
    if (!socket.activeQuestion) {
      setSelectedOption(null);
    }
  }, [socket.activeQuestion]);

  const handleJoin = () => {
    if (name.trim()) {
      socket.joinAsStudent(name.trim());
    }
  };

  const handleSubmitAnswer = () => {
    if (socket.activeQuestion && selectedOption !== null) {
      socket.submitAnswer(socket.activeQuestion.id, selectedOption);
    }
  };

  const getResultsPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (socket.kicked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">You have been removed</h2>
            <p className="text-slate-500 mb-6">The teacher has removed you from this session.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto mb-4 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600">
              <StarIcon className="w-4 h-4 fill-white text-white" />
              <span className="font-semibold text-white">Intervue Poll</span>
            </Badge>
            <CardTitle className="text-2xl">Join the Poll</CardTitle>
            <p className="text-slate-500">Enter your name to participate</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name
              </label>
              <Input
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                data-testid="input-student-name"
              />
            </div>
            <Button 
              onClick={handleJoin}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              data-testid="button-join"
            >
              Join Poll
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Welcome, {socket.student?.name}
              </h1>
              <p className="text-sm text-slate-500">Live Polling Session</p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${socket.connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {socket.activeQuestion && !socket.hasAnswered && timeRemaining !== null && timeRemaining > 0 ? (
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Answer the Question</CardTitle>
                <Badge 
                  variant={timeRemaining <= 10 ? "destructive" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span data-testid="text-time-remaining">{timeRemaining}s</span>
                </Badge>
              </div>
              <Progress 
                value={(timeRemaining / (socket.activeQuestion.timeLimit || 60)) * 100} 
                className="h-1"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xl font-medium" data-testid="text-question">
                {socket.activeQuestion.text}
              </p>
              
              <div className="space-y-2">
                {socket.activeQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOption === index ? "default" : "outline"}
                    className={`w-full justify-start h-auto py-3 px-4 text-left ${
                      selectedOption === index 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                        : ""
                    }`}
                    onClick={() => setSelectedOption(index)}
                    data-testid={`button-option-${index}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white/20 mr-3 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                data-testid="button-submit-answer"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        ) : socket.hasAnswered || (socket.results && !socket.activeQuestion) ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Poll Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socket.hasAnswered && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Your answer has been submitted!</span>
                </div>
              )}
              
              {socket.results && (
                <>
                  <p className="text-lg font-medium mb-4" data-testid="text-results-question">
                    {socket.results.questionText}
                  </p>
                  <div className="space-y-3">
                    {socket.results.options.map((option, index) => {
                      const votes = socket.results!.votes[index];
                      const percentage = getResultsPercentage(votes, socket.results!.totalVotes);
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </span>
                            <span className="font-medium" data-testid={`text-result-${index}`}>
                              {votes} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-slate-500 mt-4" data-testid="text-total-votes">
                    Total responses: {socket.results.totalVotes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Waiting for Question</h2>
              <p className="text-slate-500">
                The teacher hasn't asked a question yet. Please wait...
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {socket.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg">
          {socket.error}
        </div>
      )}
    </div>
  );
}
