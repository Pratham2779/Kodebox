import { Router } from "express";
import { getPlans } from "../controllers/plan.controller.js";

const planRouter = Router();


planRouter.get('/', getPlans);

export { planRouter };