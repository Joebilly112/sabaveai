import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// Logo, past poster, and up to 15 menu photos, each at most 2 MB once decoded.
app.use(express.json({ limit: "48mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
