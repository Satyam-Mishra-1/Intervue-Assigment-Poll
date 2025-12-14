import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BarChart3, 
  History,
  X
} from "lucide-react";
import type { PastSession } from "@shared/schema";

interface PollHistoryViewProps {
  pastSessions: PastSession[];
  onClose: () => void;
}

export function PollHistoryView({ pastSessions, onClose }: PollHistoryViewProps) {
  const [selectedSession, setSelectedSession] = useState<PastSession | null>(null);

  const getResultsPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedSession) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedSession(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">View Poll History</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Session Info */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{selectedSession.title}</h2>
                <p className="text-slate-600">{formatDate(selectedSession.endedAt)}</p>
              </CardContent>
            </Card>

            {/* Questions */}
            {selectedSession.questions.map((question, index) => {
              const results = question.results;
              
              return (
                <Card key={question.id} className="bg-white">
                  <CardHeader className="bg-slate-800 text-white">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    <p className="text-slate-200 text-base">
                      {question.text}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {question.options.map((option, optionIndex) => {
                        const votes = results.votes[optionIndex];
                        const total = results.totalVotes;
                        const percentage = getResultsPercentage(votes, total);
                        
                        return (
                          <div key={optionIndex} className="flex items-center gap-4">
                            {/* Option Number */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-medium text-slate-700">
                              {optionIndex + 1}
                            </div>
                            
                            {/* Option Text and Progress */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900">{option}</span>
                                <span className="text-sm font-medium text-slate-600">{percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3">
                                <div 
                                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Total Responses */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Total responses: {results.totalVotes} students
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <History className="w-6 h-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">View Poll History</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {pastSessions.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Past Sessions</h2>
                <p className="text-slate-500">
                  You haven't completed any poll sessions yet. Start a new session and end it to see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {session.questions.length} Questions
                          </div>
                          <div>
                            {formatDate(session.endedAt)}
                          </div>
                          <div>
                            {session.questions.reduce((total, q) => total + q.results.totalVotes, 0)} Total Responses
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setSelectedSession(session)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        View Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
