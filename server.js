const http = require("http");
const app = require("./app");

try {
  const server = http.createServer(app);
  const port = process.env.PORT || 3000;

  // Start server
  server.listen(port, () => {
    console.info("Listening on port " + port);
  });

  // Server event listeners
  server.on("listening", () => {});
  server.on("error", (error) => {
    console.error("Server error:", error);
  });
} catch (error) {
  console.error("Initialization error:", error);
}
