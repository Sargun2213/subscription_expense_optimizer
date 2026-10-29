import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Subscription Expense Optimizer Backend running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
