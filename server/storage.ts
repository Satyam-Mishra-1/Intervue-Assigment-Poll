import type { Poll, Question, Student, Response, PollResults, Teacher, PastSession } from "@shared/schema";
import { randomUUID } from "crypto";

function generateId(): string {
  return randomUUID();
}

class MemStorage {
  private polls: Map<string, Poll> = new Map();
  private questions: Map<string, Question> = new Map();
  private students: Map<string, Student> = new Map();
  private responses: Map<string, Response> = new Map();
  private teachers: Map<string, Teacher> = new Map();
  private pastSessions: Map<string, PastSession> = new Map();
  private currentTeacherSession: Map<string, { sessionId: string; questions: string[] }> = new Map();

  createPoll(title: string, teacherId: string): Poll {
    const poll: Poll = {
      id: generateId(),
      title,
      teacherId,
      createdAt: new Date(),
      isActive: true,
    };
    this.polls.set(poll.id, poll);
    return poll;
  }

  getPoll(id: string): Poll | undefined {
    return this.polls.get(id);
  }

  getActivePoll(): Poll | undefined {
    return Array.from(this.polls.values()).find(p => p.isActive);
  }

  getAllPolls(): Poll[] {
    return Array.from(this.polls.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  createQuestion(pollId: string, text: string, options: string[], correctAnswer: number = 0, timeLimit: number): Question {
    const question: Question = {
      id: generateId(),
      pollId,
      text,
      options,
      correctAnswer,
      timeLimit,
      createdAt: new Date(),
      isActive: true,
      endTime: new Date(Date.now() + timeLimit * 1000),
    };
    this.questions.set(question.id, question);
    return question;
  }

  getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  getActiveQuestion(): Question | undefined {
    return Array.from(this.questions.values()).find(q => q.isActive);
  }

  getQuestionsByPoll(pollId: string): Question[] {
    return Array.from(this.questions.values())
      .filter(q => q.pollId === pollId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  deactivateQuestion(questionId: string): void {
    const question = this.questions.get(questionId);
    if (question) {
      question.isActive = false;
      this.questions.set(questionId, question);
    }
  }

  canAskNewQuestion(): boolean {
    const activeQuestion = this.getActiveQuestion();
    if (!activeQuestion) return true;
    
    if (activeQuestion.endTime && new Date() > activeQuestion.endTime) {
      return true;
    }
    
    const students = this.getOnlineStudents();
    if (students.length === 0) return true;
    
    const responses = this.getResponsesByQuestion(activeQuestion.id);
    return responses.length >= students.length;
  }

  addStudent(name: string, socketId: string): Student {
    const existingStudent = Array.from(this.students.values()).find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingStudent) {
      existingStudent.isOnline = true;
      existingStudent.socketId = socketId;
      this.students.set(existingStudent.id, existingStudent);
      return existingStudent;
    }

    const student: Student = {
      id: generateId(),
      name,
      joinedAt: new Date(),
      isOnline: true,
      socketId,
    };
    this.students.set(student.id, student);
    return student;
  }

  getStudent(id: string): Student | undefined {
    return this.students.get(id);
  }

  getStudentBySocketId(socketId: string): Student | undefined {
    return Array.from(this.students.values()).find(s => s.socketId === socketId);
  }

  getStudentByName(name: string): Student | undefined {
    return Array.from(this.students.values()).find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );
  }

  getOnlineStudents(): Student[] {
    return Array.from(this.students.values()).filter(s => s.isOnline);
  }

  getAllStudents(): Student[] {
    return Array.from(this.students.values());
  }

  setStudentOffline(socketId: string): void {
    const student = this.getStudentBySocketId(socketId);
    if (student) {
      student.isOnline = false;
      student.socketId = null;
      this.students.set(student.id, student);
    }
  }

  removeStudent(studentId: string): boolean {
    return this.students.delete(studentId);
  }

  submitResponse(questionId: string, studentId: string, studentName: string, selectedOption: number): Response {
    const existingResponse = Array.from(this.responses.values()).find(
      r => r.questionId === questionId && r.studentId === studentId
    );
    
    if (existingResponse) {
      return existingResponse;
    }

    const response: Response = {
      id: generateId(),
      questionId,
      studentId,
      studentName,
      selectedOption,
      answeredAt: new Date(),
    };
    this.responses.set(response.id, response);
    return response;
  }

  getResponsesByQuestion(questionId: string): Response[] {
    return Array.from(this.responses.values()).filter(r => r.questionId === questionId);
  }

  hasStudentAnswered(questionId: string, studentId: string): boolean {
    return Array.from(this.responses.values()).some(
      r => r.questionId === questionId && r.studentId === studentId
    );
  }

  getPollResults(questionId: string): PollResults | null {
    const question = this.getQuestion(questionId);
    if (!question) return null;

    const responses = this.getResponsesByQuestion(questionId);
    const votes = new Array(question.options.length).fill(0);
    
    responses.forEach(r => {
      if (r.selectedOption >= 0 && r.selectedOption < votes.length) {
        votes[r.selectedOption]++;
      }
    });

    return {
      questionId,
      questionText: question.text,
      options: question.options,
      votes,
      totalVotes: responses.length,
      responses: responses.map(r => ({
        studentName: r.studentName,
        selectedOption: r.selectedOption,
      })),
    };
  }

  getAllPollResults(): PollResults[] {
    const questions = Array.from(this.questions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return questions
      .map(q => this.getPollResults(q.id))
      .filter((r): r is PollResults => r !== null);
  }

  // Teacher management methods
  createOrUpdateTeacher(name: string, email?: string): Teacher {
    const existingTeacher = Array.from(this.teachers.values()).find(
      t => t.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingTeacher) {
      existingTeacher.lastActiveAt = new Date();
      if (email) existingTeacher.email = email;
      this.teachers.set(existingTeacher.id, existingTeacher);
      return existingTeacher;
    }

    const teacher: Teacher = {
      id: generateId(),
      name,
      email,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.teachers.set(teacher.id, teacher);
    return teacher;
  }

  getTeacher(id: string): Teacher | undefined {
    return this.teachers.get(id);
  }

  getTeacherByName(name: string): Teacher | undefined {
    return Array.from(this.teachers.values()).find(
      t => t.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Past session management methods
  startTeacherSession(teacherId: string): string {
    const sessionId = generateId();
    this.currentTeacherSession.set(teacherId, { sessionId, questions: [] });
    console.log("Started teacher session:", teacherId, "sessionId:", sessionId);
    return sessionId;
  }

  addQuestionToSession(teacherId: string, questionId: string): void {
    const session = this.currentTeacherSession.get(teacherId);
    if (session) {
      session.questions.push(questionId);
      console.log("Added question to session:", teacherId, "questionId:", questionId, "total questions:", session.questions.length);
    } else {
      console.log("No active session found for teacher:", teacherId);
    }
  }

  endTeacherSession(teacherId: string, title: string): PastSession | null {
    const session = this.currentTeacherSession.get(teacherId);
    console.log("Attempting to end session for teacher:", teacherId, "session:", session);
    if (!session) {
      console.log("Cannot end session - no session found");
      return null;
    }

    const pastSession: PastSession = {
      id: session.sessionId,
      teacherId,
      title,
      startedAt: new Date(), // In a real implementation, you'd track when session started
      endedAt: new Date(),
      questions: session.questions.map(questionId => {
        const question = this.getQuestion(questionId);
        if (!question) return null;
        
        const results = this.getPollResults(questionId);
        return {
          id: question.id,
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          timeLimit: question.timeLimit,
          results: results || {
            questionId: question.id,
            questionText: question.text,
            options: question.options,
            votes: new Array(question.options.length).fill(0),
            totalVotes: 0,
            responses: [],
          },
        };
      }).filter((q): q is NonNullable<typeof q> => q !== null),
    };

    this.pastSessions.set(pastSession.id, pastSession);
    this.currentTeacherSession.delete(teacherId);
    return pastSession;
  }

  getPastSessionsByTeacher(teacherId: string): PastSession[] {
    return Array.from(this.pastSessions.values())
      .filter(session => session.teacherId === teacherId)
      .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime());
  }

  getPastSession(id: string): PastSession | undefined {
    return this.pastSessions.get(id);
  }

  createTestPastSession(teacherId: string): PastSession {
    const testSession: PastSession = {
      id: generateId(),
      teacherId,
      title: "Test Session - " + new Date().toLocaleTimeString(),
      startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      endedAt: new Date(),
      questions: [
        {
          id: generateId(),
          text: "What is your favorite programming language?",
          options: ["JavaScript", "Python", "TypeScript", "Java"],
          correctAnswer: 0,
          timeLimit: 60,
          results: {
            questionId: generateId(),
            questionText: "What is your favorite programming language?",
            totalVotes: 15,
            options: ["JavaScript", "Python", "TypeScript", "Java"],
            votes: [5, 4, 3, 3],
            responses: [
              { studentName: "Alice", selectedOption: 0 },
              { studentName: "Bob", selectedOption: 1 },
              { studentName: "Charlie", selectedOption: 0 },
              { studentName: "David", selectedOption: 2 },
              { studentName: "Eve", selectedOption: 1 }
            ]
          }
        },
        {
          id: generateId(),
          text: "How do you rate this polling system?",
          options: ["Excellent", "Good", "Average", "Poor"],
          correctAnswer: 0,
          timeLimit: 30,
          results: {
            questionId: generateId(),
            questionText: "How do you rate this polling system?",
            totalVotes: 12,
            options: ["Excellent", "Good", "Average", "Poor"],
            votes: [6, 4, 1, 1],
            responses: [
              { studentName: "Alice", selectedOption: 0 },
              { studentName: "Bob", selectedOption: 1 },
              { studentName: "Charlie", selectedOption: 0 },
              { studentName: "David", selectedOption: 1 },
              { studentName: "Eve", selectedOption: 0 }
            ]
          }
        }
      ]
    };
    
    this.pastSessions.set(testSession.id, testSession);
    console.log("Created test past session:", testSession.id);
    return testSession;
  }
}

export const storage = new MemStorage();
