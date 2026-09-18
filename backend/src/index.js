import http from "http";
import { config } from "dotenv";
config();

import { app } from "./app.js";
import { connectDB, sequelize } from "./configs/db/index.js";
import { initTerminalSocket } from "../sockets/terminal.socket.js";


import "./models/index.js";


import { startBackupCron } from "../jobs/backup.cron.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {

    await connectDB();

    // Sync Models (Development Mode)
    // In production, use Migrations instead of sync({ alter: true })
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
    }

    startBackupCron();

    const server = http.createServer(app);

    initTerminalSocket(server);

    server.listen(PORT, () => {
      console.log(`\nServer running on port : ${PORT}`);
      console.log(`Local URL : http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();