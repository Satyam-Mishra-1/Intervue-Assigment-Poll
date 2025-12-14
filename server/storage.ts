import type { Poll, Question, Student, Response, PollResults } from "@shared/schema";
import { randomUUID } from "crypto";

function generateId(): string {
  return randomUUID();
}

class MemStorage {
  private polls: Map<string, Poll> = new Map();
  private questions: Map<string, Question> = new Map();
  private students: Map<string, Student> = new Map();
  private responses: Map<string, Response> = new Map();

  createPoll(title: string): Poll {
    const poll: Poll = {
      id: generateId(),
      title,
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

  createQuestion(pollId: string, text: string, options: string[], timeLimit: number): Question {
    const question: Question = {
      id: generateId(),
      pollId,
      text,
      options,
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
}

export const storage = new MemStorage();
