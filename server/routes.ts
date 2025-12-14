import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSocket } from "./socket";
import { storage } from "./storage";

let httpServer: Server | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/poll/state", (req, res) => {
    const activeQuestion = storage.getActiveQuestion();
    const students = storage.getOnlineStudents();
    const canAskQuestion = storage.canAskNewQuestion();
    const activePoll = storage.getActivePoll();

    res.json({
      activeQuestion,
      students,
      canAskQuestion,
      activePoll,
      results: activeQuestion ? storage.getPollResults(activeQuestion.id) : null,
    });
  });

  app.get("/api/poll/results", (req, res) => {
    const results = storage.getAllPollResults();
    res.json({ results });
  });

  app.get("/api/students", (req, res) => {
    const students = storage.getOnlineStudents();
    res.json({ students });
  });

  // Create server only once for Socket.IO
  if (!httpServer) {
    httpServer = createServer(app);
    setupSocket(httpServer);
  }

  return httpServer;
}

export function getServer(): Server | null {
  return httpServer;
}
