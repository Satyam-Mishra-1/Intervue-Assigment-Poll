import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChatSystem } from "@/components/ChatSystem";
import { 
  Clock, 
  BarChart3, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  StarIcon,
  MessageCircle,
  UserMinus
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
  const [showChat, setShowChat] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

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
    if (isChatVisible) {
      socket.markMessagesAsRead();
    }
    socket.setChatVisible(isChatVisible);
  }, [isChatVisible, socket.markMessagesAsRead, socket.setChatVisible]);

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
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <UserMinus className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">You've been Kicked out!</h2>
            <p className="text-slate-600 mb-8">The teacher has removed you from this session.</p>
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3"
              data-testid="button-go-home"
            >
              Go to Home Screen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <Badge className="w-fit mx-auto mb-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600">
            <StarIcon className="w-5 h-5 fill-white text-white" />
            <span className="font-bold text-white text-lg">Intervue Poll</span>
          </Badge>
          <h1 className="text-6xl font-bold text-gray-900 mb-8">Let's Get Started</h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            If you're a student, you'll be able to <span className="font-bold text-gray-800">submit your answers</span>, participate in live
            polls, and see how your responses compare with your classmates
          </p>
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-left">
              <label htmlFor="name-input" className="text-gray-700 font-semibold text-xl mb-3 block">Enter your Name</label>
              <Input
                id="name-input"
                placeholder="Rahul Bajaj"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="h-16 text-xl px-4 rounded-lg border-2 border-gray-300 focus:border-purple-500 transition-colors"
                data-testid="input-student-name"
              />
            </div>
            <Button 
              onClick={handleJoin}
              disabled={!name.trim()}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-xl transition-all duration-200 shadow-xl hover:shadow-2xl rounded-lg"
              data-testid="button-join"
            >
              Continue
            </Button>
          </div>
        </div>
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
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
            <div className="text-center">
              <Badge className="w-fit mx-auto mb-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600">
                <StarIcon className="w-5 h-5 fill-white text-white" />
                <span className="font-bold text-white text-lg">Intervue Poll</span>
              </Badge>
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wait for the teacher to ask questions..</h2>
            </div>
          </div>
        )}
      </main>

      {socket.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg">
          {socket.error}
        </div>
      )}

      {/* Floating Chat Window */}
      {showChat && (
        <div className="fixed top-0 right-0 h-full w-1/3 z-50 shadow-2xl bg-white">
          <ChatSystem 
            socket={socket} 
            teacherName={socket.student?.name || "Student"} 
            onVisibleChange={setIsChatVisible}
            role="student"
          />
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        size="icon"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {socket.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {socket.unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
