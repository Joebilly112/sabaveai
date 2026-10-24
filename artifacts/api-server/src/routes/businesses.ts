import { Router, type IRouter } from "express";
import { ListBusinessesResponse } from "@workspace/api-zod";
import { getStore } from "../lib/store";

const router: IRouter = Router();

router.get("/businesses", (_req, res) => {
  const businesses = ListBusinessesResponse.parse(getStore().businesses);
  res.json(businesses);
});

export default router;
