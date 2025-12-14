import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { storage } from "./storage";
import type { Question, PollResults, Student, Teacher, PastSession } from "@shared/schema";

let io: Server;
let questionTimers: Map<string, NodeJS.Timeout> = new Map();

export function setupSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("teacher:join", () => {
      socket.join("teachers");
      
      // Create or get teacher record
      const teacher = storage.createOrUpdateTeacher("Teacher");
      socket.data.teacherId = teacher.id;
      
      // Start a new session for this teacher
      storage.startTeacherSession(teacher.id);
      
      const activeQuestion = storage.getActiveQuestion();
      const students = storage.getOnlineStudents();
      const canAskQuestion = storage.canAskNewQuestion();
      
      socket.emit("state:sync", {
        activeQuestion,
        students,
        canAskQuestion,
        results: activeQuestion ? storage.getPollResults(activeQuestion.id) : null,
      });
    });

    socket.on("student:join", (data: { name: string }) => {
      const student = storage.addStudent(data.name, socket.id);
      socket.join("students");
      socket.data.studentId = student.id;
      socket.data.studentName = student.name;

      const activeQuestion = storage.getActiveQuestion();
      const hasAnswered = activeQuestion 
        ? storage.hasStudentAnswered(activeQuestion.id, student.id) 
        : false;

      socket.emit("student:joined", {
        student,
        activeQuestion,
        hasAnswered,
        results: hasAnswered && activeQuestion ? storage.getPollResults(activeQuestion.id) : null,
      });

      io.to("teachers").emit("students:update", {
        students: storage.getOnlineStudents(),
        canAskQuestion: storage.canAskNewQuestion(),
      });
    });

    socket.on("teacher:createPoll", (data: { title: string }) => {
      const teacherId = socket.data.teacherId;
      if (!teacherId) {
        socket.emit("error", { message: "Teacher not authenticated" });
        return;
      }
      
      const poll = storage.createPoll(data.title, teacherId);
      socket.emit("poll:created", poll);
    });

    socket.on("teacher:askQuestion", (data: { text: string; options: string[]; timeLimit: number; correctAnswer?: number }) => {
      const teacherId = socket.data.teacherId;
      if (!teacherId) {
        socket.emit("error", { message: "Teacher not authenticated" });
        return;
      }
      
      if (!storage.canAskNewQuestion()) {
        socket.emit("error", { message: "Cannot ask a new question yet. Wait for all students to answer." });
        return;
      }

      const activeQuestion = storage.getActiveQuestion();
      if (activeQuestion) {
        storage.deactivateQuestion(activeQuestion.id);
        const existingTimer = questionTimers.get(activeQuestion.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
          questionTimers.delete(activeQuestion.id);
        }
      }

      const activePoll = storage.getActivePoll() || storage.createPoll("Live Poll", teacherId);
      const question = storage.createQuestion(
        activePoll.id,
        data.text,
        data.options,
        data.correctAnswer || 0,
        data.timeLimit || 60
      );

      // Add question to teacher's current session
      storage.addQuestionToSession(teacherId, question.id);

      io.emit("question:new", {
        question,
        endTime: question.endTime,
      });

      const timer = setTimeout(() => {
        endQuestion(question.id);
      }, (data.timeLimit || 60) * 1000);

      questionTimers.set(question.id, timer);

      io.to("teachers").emit("students:update", {
        students: storage.getOnlineStudents(),
        canAskQuestion: false,
      });
    });

    socket.on("student:answer", (data: { questionId: string; selectedOption: number }) => {
      const studentId = socket.data.studentId;
      const studentName = socket.data.studentName;

      if (!studentId || !studentName) {
        socket.emit("error", { message: "You must join first" });
        return;
      }

      const question = storage.getQuestion(data.questionId);
      if (!question || !question.isActive) {
        socket.emit("error", { message: "Question is no longer active" });
        return;
      }

      if (storage.hasStudentAnswered(data.questionId, studentId)) {
        socket.emit("error", { message: "You have already answered this question" });
        return;
      }

      storage.submitResponse(data.questionId, studentId, studentName, data.selectedOption);

      const results = storage.getPollResults(data.questionId);
      const canAskQuestion = storage.canAskNewQuestion();
      
      socket.emit("answer:submitted", { results });

      io.to("students").emit("results:update", {
        results,
        canAskQuestion,
      });

      io.to("teachers").emit("results:update", {
        results,
        canAskQuestion,
      });

      if (canAskQuestion) {
        io.to("teachers").emit("students:update", {
          students: storage.getOnlineStudents(),
          canAskQuestion: true,
        });
      }
    });

    socket.on("teacher:endQuestion", (data: { questionId: string }) => {
      endQuestion(data.questionId);
    });

    socket.on("teacher:removeStudent", (data: { studentId: string }) => {
      const student = storage.getStudent(data.studentId);
      if (student && student.socketId) {
        const studentSocket = io.sockets.sockets.get(student.socketId);
        if (studentSocket) {
          studentSocket.emit("kicked");
          studentSocket.disconnect();
        }
      }
      storage.removeStudent(data.studentId);
      
      io.to("teachers").emit("students:update", {
        students: storage.getOnlineStudents(),
        canAskQuestion: storage.canAskNewQuestion(),
      });
    });

    socket.on("teacher:getPastResults", () => {
      const teacherId = socket.data.teacherId;
      if (!teacherId) {
        socket.emit("error", { message: "Teacher not authenticated" });
        return;
      }
      
      const results = storage.getPastSessionsByTeacher(teacherId);
      console.log("Sending past results for teacher", teacherId, ":", results);
      socket.emit("pastResults:update", { results });
    });

    socket.on("teacher:createTestSession", () => {
      const teacherId = socket.data.teacherId;
      if (!teacherId) {
        socket.emit("error", { message: "Teacher not authenticated" });
        return;
      }
      
      const testSession = storage.createTestPastSession(teacherId);
      console.log("Created test session for teacher", teacherId);
      console.log("Test session data:", testSession);
      
      // Also immediately send past results to verify they exist
      const results = storage.getPastSessionsByTeacher(teacherId);
      console.log("Past sessions after creation:", results);
      
      socket.emit("testSession:created", testSession);
    });

    socket.on("teacher:endSession", (data: { title: string }) => {
      const teacherId = socket.data.teacherId;
      if (!teacherId) {
        socket.emit("error", { message: "Teacher not authenticated" });
        return;
      }
      
      console.log("Ending session for teacher:", teacherId, "with title:", data.title);
      const pastSession = storage.endTeacherSession(teacherId, data.title);
      console.log("Past session created:", pastSession);
      if (pastSession) {
        socket.emit("session:ended", pastSession);
      } else {
        console.log("No past session created - possibly no questions in session");
      }
    });

    socket.on("chat:message", (data: { text: string }) => {
      const isTeacher = socket.rooms.has("teachers");
      const userName = isTeacher ? "Teacher" : (socket.data.studentName || "Student");
      
      const messageData = {
        id: Date.now().toString(),
        user: userName,
        text: data.text,
        timestamp: new Date(),
        isTeacher: isTeacher
      };
      
      // Broadcast message to all connected clients (teacher and students)
      io.emit("chat:message", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      storage.setStudentOffline(socket.id);

      io.to("teachers").emit("students:update", {
        students: storage.getOnlineStudents(),
        canAskQuestion: storage.canAskNewQuestion(),
      });
    });
  });

  return io;
}

function endQuestion(questionId: string) {
  storage.deactivateQuestion(questionId);
  const results = storage.getPollResults(questionId);

  const timer = questionTimers.get(questionId);
  if (timer) {
    clearTimeout(timer);
    questionTimers.delete(questionId);
  }

  io.emit("question:ended", { results });
  
  io.to("teachers").emit("students:update", {
    students: storage.getOnlineStudents(),
    canAskQuestion: true,
  });
}

export { io };
