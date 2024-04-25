import fs, { appendFile } from "node:fs";
import path from "node:path";
import express from "express";
import subdomain from "express-subdomain";

// List of apps to serve.
// Excluding the .git and node_modules directories,
// each directory represents a subdomain serving static files.
const ignoreDirs = new Set([".git", "node_modules"]);
const myApps = fs.readdirSync(__dirname)
                  .filter(name => fs.lstatSync(path.join(__dirname, name)).isDirectory())
                  .filter(name => !ignoreDirs.has(name));

const server = express();

// Middleware to set subdomain offset. This enables development on localhost.
// Without this, the subdomain routing would not work.
server.use(function(req, res, next) {
  const topDomain = req.hostname.split(".").reverse()[0];
  const offset = (topDomain === "localhost" ? 1 : 2);
  req.app.set("subdomain offset", offset);
  next();
});

// Set up subdomain routing.
for (const app of myApps) {
  server.use(subdomain(app, express.static(app)));
}

// Serve static files from "www/" directory when there is no subdomain.
server.use("/", express.static("www"));

console.log("Server listening on port: 8080");
server.listen(8080);
