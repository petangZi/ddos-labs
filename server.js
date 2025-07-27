const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const log = `[${new Date().toISOString()}] IP: ${ip} | UA: ${ua}\n`;
  fs.appendFileSync("access_log.txt", log);
  next();
});

app.get("/data", (req, res) => {
  const now = Date.now();
  let hits = 0;
  const lines = fs.existsSync("access_log.txt") ? fs.readFileSync("access_log.txt", "utf8").split("\n") : [];
  lines.forEach(line => {
    const match = line.match(/\[(.*?)\]/);
    if (match) {
      const time = new Date(match[1]).getTime();
      if (now - time < 1000) hits++;
    }
  });
  res.json({ hits });
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
