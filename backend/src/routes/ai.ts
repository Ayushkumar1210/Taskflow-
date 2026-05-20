import express from 'express';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  // Mock AI delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  let response = "I'm a simulated AI assistant. I can help you with your TaskFlow board!";
  
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('auth') || lowerMessage.includes('login')) {
    response = `Here are some tasks to build an authentication system:
- Login Page
- Register API
- JWT Middleware
- Auth Testing`;
  } else if (lowerMessage.includes('priority')) {
    response = "Based on your board, I suggest prioritizing the **Backend API** and **Database Schema** first.";
  } else if (lowerMessage.includes('summarize')) {
    response = "You have 3 tasks in Todo, 1 in Progress, and 2 Done. You are on track for this sprint!";
  }

  res.json({ response });
});

router.post('/breakdown', async (req, res) => {
  const { title } = req.body;

  // Mock AI delay
  await new Promise(resolve => setTimeout(resolve, 1500));

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
  } else if (title.toLowerCase().includes('database')) {
    subtasks = [
      "Design Schema",
      "Run Migrations",
      "Seed Initial Data",
      "Optimize Queries"
    ];
  }

  res.json({ subtasks });
});

export default router;
