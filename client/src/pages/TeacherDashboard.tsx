import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  BarChart3, 
  History,
  ArrowLeft,
  Send,
  UserMinus
} from "lucide-react";
import { useLocation } from "wouter";

export function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const socket = useSocket("teacher");
  
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showPastResults, setShowPastResults] = useState(false);

  useEffect(() => {
    if (showPastResults) {
      socket.getPastResults();
    }
  }, [showPastResults, socket.getPastResults]);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAskQuestion = () => {
    const validOptions = options.filter(o => o.trim() !== "");
    if (questionText.trim() && validOptions.length >= 2) {
      socket.askQuestion(questionText, validOptions, timeLimit);
      setQuestionText("");
      setOptions(["", ""]);
    }
  };

  const getResultsPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
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
              <h1 className="text-xl font-semibold text-slate-900">Teacher Dashboard</h1>
              <p className="text-sm text-slate-500">Manage your live polls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1">
              <Users className="w-3.5 h-3.5" />
              <span data-testid="text-student-count">{socket.students.length} Students</span>
            </Badge>
            <div className={`w-2 h-2 rounded-full ${socket.connected ? "bg-green-500" : "bg-red-500"}`} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ask a Question
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <Input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Math.max(10, Math.min(300, parseInt(e.target.value) || 60)))}
                    className="w-20"
                    min={10}
                    max={300}
                    data-testid="input-time-limit"
                  />
                  <span className="text-sm text-slate-500">seconds</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter your question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="text-lg"
                  data-testid="input-question"
                />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Options</p>
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs flex items-center justify-center font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        data-testid={`input-option-${index}`}
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          data-testid={`button-remove-option-${index}`}
                        >
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={addOption}
                    disabled={options.length >= 6}
                    data-testid="button-add-option"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                  <Button
                    onClick={handleAskQuestion}
                    disabled={!socket.canAskQuestion || !questionText.trim() || options.filter(o => o.trim()).length < 2}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    data-testid="button-ask-question"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                  {!socket.canAskQuestion && (
                    <span className="text-sm text-amber-600">Waiting for students to answer...</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {socket.activeQuestion && (
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Clock className="w-5 h-5" />
                    Active Question
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => socket.endQuestion(socket.activeQuestion!.id)}
                    data-testid="button-end-question"
                  >
                    End Question
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-purple-900 mb-4" data-testid="text-active-question">
                    {socket.activeQuestion.text}
                  </p>
                  <div className="space-y-2">
                    {socket.activeQuestion.options.map((option, index) => {
                      const votes = socket.results?.votes[index] || 0;
                      const total = socket.results?.totalVotes || 0;
                      const percentage = getResultsPercentage(votes, total);
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </span>
                            <span className="font-medium" data-testid={`text-votes-${index}`}>
                              {votes} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-slate-600 mt-4" data-testid="text-total-responses">
                    {socket.results?.totalVotes || 0} of {socket.students.length} students responded
                  </p>
                </CardContent>
              </Card>
            )}

            {!socket.activeQuestion && socket.results && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Latest Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium mb-4">{socket.results.questionText}</p>
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
                            <span className="font-medium">{votes} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Students Online
                </CardTitle>
                <Badge variant="secondary">{socket.students.length}</Badge>
              </CardHeader>
              <CardContent>
                {socket.students.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No students have joined yet
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {socket.students.map((student) => (
                      <li 
                        key={student.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                        data-testid={`student-${student.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => socket.removeStudent(student.id)}
                          data-testid={`button-remove-student-${student.id}`}
                        >
                          <UserMinus className="w-4 h-4 text-slate-400" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowPastResults(!showPastResults)}
                >
                  <History className="w-5 h-5" />
                  Past Results
                </CardTitle>
              </CardHeader>
              {showPastResults && (
                <CardContent className="max-h-96 overflow-y-auto">
                  {socket.pastResults.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No past results yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {socket.pastResults.map((result, idx) => (
                        <div 
                          key={result.questionId} 
                          className="p-3 rounded-lg bg-slate-50 space-y-2"
                          data-testid={`past-result-${idx}`}
                        >
                          <p className="text-sm font-medium">{result.questionText}</p>
                          <div className="space-y-1">
                            {result.options.map((option, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span>{option}</span>
                                <span>{result.votes[i]} votes</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            Total: {result.totalVotes} responses
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>

      {socket.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg">
          {socket.error}
        </div>
      )}
    </div>
  );
}
