"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    // Mock AI delay
    yield new Promise(resolve => setTimeout(resolve, 1000));
    let response = "I'm a simulated AI assistant. I can help you with your TaskFlow board!";
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('auth') || lowerMessage.includes('login')) {
        response = `Here are some tasks to build an authentication system:
- Login Page
- Register API
- JWT Middleware
- Auth Testing`;
    }
    else if (lowerMessage.includes('priority')) {
        response = "Based on your board, I suggest prioritizing the **Backend API** and **Database Schema** first.";
    }
    else if (lowerMessage.includes('summarize')) {
        response = "You have 3 tasks in Todo, 1 in Progress, and 2 Done. You are on track for this sprint!";
    }
    res.json({ response });
}));
router.post('/breakdown', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    // Mock AI delay
    yield new Promise(resolve => setTimeout(resolve, 1500));
    let subtasks = [
        "Initial Setup & Configuration",
        "Frontend Implementation",
        "Backend Integration",
        "Testing and QA"
    ];
    if (title.toLowerCase().includes('auth')) {
        subtasks = [
            "Create User Model",
            "Implement JWT Middleware",
            "Build Login/Register UI",
            "Write Auth Tests"
        ];
    }
    else if (title.toLowerCase().includes('database')) {
        subtasks = [
            "Design Schema",
            "Run Migrations",
            "Seed Initial Data",
            "Optimize Queries"
        ];
    }
    res.json({ subtasks });
}));
exports.default = router;
