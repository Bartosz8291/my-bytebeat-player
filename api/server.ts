import express, { Request, Response } from "express";
import path from "path";
import createServer from "vercel-node-server";

const app = express();

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

export default createServer(app);
