import { config } from "dotenv";
config({ path: ".env" });

import { app } from "./app.js";
import { connectDB, sequelize } from "./configs/db/index.js";
import "./models/index.js";

const PORT = process.env.PORT;

;(async () => {
  try {

    await connectDB();

    
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({force:true});
      console.log("Models synced (development only)");
    }

    
    app.listen(PORT, () => {
      console.log(`Server running on port : ${PORT}`);
      console.log(`Server URL : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed", error);
  }
})();
