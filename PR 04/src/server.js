const app = require("../app");
const connectDatabase = require("../config/database");

const port = Number(process.env.PORT || 9094);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`StudentVerse running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();
