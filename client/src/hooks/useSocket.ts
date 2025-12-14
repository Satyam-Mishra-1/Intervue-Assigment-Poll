import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Question, PollResults, Student, PastSession } from "@shared/schema";

interface SocketState {
  connected: boolean;
  activeQuestion: Question | null;
  results: PollResults | null;
  students: Student[];
  canAskQuestion: boolean;
  hasAnswered: boolean;
  student: Student | null;
  pastResults: PastSession[];
  error: string | null;
  kicked: boolean;
  messages: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: Date;
    isTeacher?: boolean;
  }>;
  unreadCount: number;
  isChatVisible: boolean;
}

export function useSocket(role: "teacher" | "student" | null) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    activeQuestion: null,
    results: null,
    students: [],
    canAskQuestion: true,
    hasAnswered: false,
    student: null,
    pastResults: [],
    error: null,
    kicked: false,
    messages: [],
    unreadCount: 0,
    isChatVisible: false,
  });

  useEffect(() => {
    if (!role) return;

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setState(s => ({ ...s, connected: true }));
    });

    socket.on("disconnect", () => {
      setState(s => ({ ...s, connected: false }));
    });

    socket.on("state:sync", (data) => {
      setState(s => ({
        ...s,
        activeQuestion: data.activeQuestion,
        students: data.students,
        canAskQuestion: data.canAskQuestion,
        results: data.results,
      }));
    });

    socket.on("student:joined", (data) => {
      setState(s => ({
        ...s,
        student: data.student,
        activeQuestion: data.activeQuestion,
        hasAnswered: data.hasAnswered,
        results: data.results,
      }));
    });

    socket.on("students:update", (data) => {
      setState(s => ({
        ...s,
        students: data.students,
        canAskQuestion: data.canAskQuestion,
      }));
    });

    socket.on("question:new", (data) => {
      setState(s => ({
        ...s,
        activeQuestion: data.question,
        hasAnswered: false,
        results: null,
      }));
    });

    socket.on("answer:submitted", (data) => {
      setState(s => ({
        ...s,
        hasAnswered: true,
        results: data.results,
      }));
    });

    socket.on("results:update", (data) => {
      setState(s => ({
        ...s,
        results: data.results,
        canAskQuestion: data.canAskQuestion,
      }));
    });

    socket.on("question:ended", (data) => {
      setState(s => ({
        ...s,
        activeQuestion: null,
        results: data.results,
        canAskQuestion: true,
      }));
    });

    socket.on("pastResults:update", (data) => {
      console.log("Received past results:", data.results);
      console.log("Past results length:", data.results?.length || 0);
      console.log("Past results type:", typeof data.results);
      console.log("Is array?", Array.isArray(data.results));
      setState(s => ({
        ...s,
        pastResults: data.results,
      }));
    });

    socket.on("session:ended", (data) => {
      console.log("Session ended successfully:", data);
    });

    socket.on("testSession:created", (data) => {
      console.log("Test session created:", data);
      // Automatically fetch past results after creating test session
      socketRef.current?.emit("teacher:getPastResults");
    });

    socket.on("error", (data) => {
      setState(s => ({ ...s, error: data.message }));
      setTimeout(() => setState(s => ({ ...s, error: null })), 3000);
    });

    socket.on("kicked", () => {
      setState(s => ({ ...s, kicked: true }));
    });

    socket.on("chat:message", (data) => {
      setState(s => {
        // Don't count own messages as unread
        const isOwnMessage = (role === "teacher" && data.isTeacher) || 
                           (role === "student" && data.user === s.student?.name);
        
        // Only increment unread count if chat is not visible and message is from others
        const shouldIncrement = !isOwnMessage && !s.isChatVisible;
        
        return {
          ...s,
          messages: [...s.messages, {
            id: data.id,
            user: data.user,
            text: data.text,
            timestamp: new Date(data.timestamp),
            isTeacher: data.isTeacher,
          }],
          unreadCount: shouldIncrement ? s.unreadCount + 1 : s.unreadCount
        };
      });
    });

    if (role === "teacher") {
      socket.emit("teacher:join");
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role]);

  const joinAsStudent = useCallback((name: string) => {
    socketRef.current?.emit("student:join", { name });
  }, []);

  const askQuestion = useCallback((text: string, options: string[], timeLimit: number, correctAnswer?: number) => {
    socketRef.current?.emit("teacher:askQuestion", { text, options, timeLimit, correctAnswer });
  }, []);

  const submitAnswer = useCallback((questionId: string, selectedOption: number) => {
    socketRef.current?.emit("student:answer", { questionId, selectedOption });
  }, []);

  const endQuestion = useCallback((questionId: string) => {
    socketRef.current?.emit("teacher:endQuestion", { questionId });
  }, []);

  const removeStudent = useCallback((studentId: string) => {
    socketRef.current?.emit("teacher:removeStudent", { studentId });
  }, []);

  const getPastResults = useCallback(() => {
    socketRef.current?.emit("teacher:getPastResults");
  }, []);

  const endSession = useCallback((title: string) => {
    socketRef.current?.emit("teacher:endSession", { title });
  }, []);

  const createTestSession = useCallback(() => {
    socketRef.current?.emit("teacher:createTestSession");
  }, []);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit("chat:message", { text });
  }, []);

  const markMessagesAsRead = useCallback(() => {
    setState(s => ({ ...s, unreadCount: 0 }));
  }, []);

  const setChatVisible = useCallback((visible: boolean) => {
    setState(s => ({ ...s, isChatVisible: visible }));
  }, []);

  return {
    ...state,
    joinAsStudent,
    askQuestion,
    submitAnswer,
    endQuestion,
    removeStudent,
    getPastResults,
    endSession,
    createTestSession,
    sendMessage,
    markMessagesAsRead,
    setChatVisible,
  };
}
