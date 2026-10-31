import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import app from "./app.mjs";

// Same Express app as local. DeepSeek reads DEEPSEEK_API_KEY from the function environment.
export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
    invoker: "public",
    secrets: [defineSecret("DEEPSEEK_API_KEY")],
  },
  app,
);
