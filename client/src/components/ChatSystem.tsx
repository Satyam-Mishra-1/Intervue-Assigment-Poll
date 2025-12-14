import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Users, MessageCircle, UserMinus } from "lucide-react";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  isTeacher?: boolean;
}

interface Participant {
  id: string;
  name: string;
  isTeacher?: boolean;
  isOnline?: boolean;
}

interface ChatSystemProps {
  socket: any;
  teacherName?: string;
  onVisibleChange?: (visible: boolean) => void;
  role?: "teacher" | "student";
}

export function ChatSystem({ socket, teacherName = "Teacher", onVisibleChange, role }: ChatSystemProps) {
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Notify parent that chat is visible when component mounts
    if (onVisibleChange) {
      onVisibleChange(true);
    }
    
    // Notify parent that chat is hidden when component unmounts
    return () => {
      if (onVisibleChange) {
        onVisibleChange(false);
      }
    };
  }, [onVisibleChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Custom scrollbar styles
  const scrollbarStyles = `
    .chat-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .chat-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .chat-scrollbar::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    .chat-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `;

  useEffect(() => {
    scrollToBottom();
  }, [socket.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKickOut = (participant: Participant) => {
    // Only teachers can kick out students, not other teachers
    if (role === "teacher" && !participant.isTeacher) {
      socket.removeStudent(participant.id);
    }
  };

  const canKickOut = (participant: Participant) => {
    // Only teachers can kick out and only students can be kicked out
    return role === "teacher" && !participant.isTeacher;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Create participants list from socket students and teacher
  const participants: Participant[] = [
    { id: "teacher", name: teacherName, isTeacher: true, isOnline: true },
    ...socket.students.map((student: any) => ({
      id: student.id,
      name: student.name,
      isOnline: true,
    })),
  ];

  return (
    <>
      <style>{scrollbarStyles}</style>
      <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat Room
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96 scroll-smooth chat-scrollbar">
              {socket.messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.isTeacher ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      message.isTeacher ? 'text-purple-600' : 'text-slate-600'
                    }`}>
                      {message.user}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg ${
                      message.isTeacher
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : 'bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="participants" className="flex-1 mt-0">
            <div className="p-4 space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          participant.isOnline ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {participant.name}
                      </p>
                      {participant.isTeacher && (
                        <Badge variant="secondary" className="text-xs">
                          Teacher
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">
                      {participant.isOnline ? 'Online' : 'Offline'}
                    </div>
                    {canKickOut(participant) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleKickOut(participant)}
                        className="text-red-800 hover:text-red-900 hover:bg-red-100 flex flex-col items-center gap-1 px-2 py-1"
                        title="Kick out"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="text-xs">Kick out</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
}
