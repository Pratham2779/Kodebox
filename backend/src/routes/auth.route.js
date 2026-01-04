import { Router } from "express";
import { confirmEmailVerification, login, logout, refresh, requestEmailVerification } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const authRouter=Router();


authRouter.post('/login',login);

authRouter.post('/logout',isAuthenticated,logout);

authRouter.post('/refresh',refresh);

authRouter.post('/email/verification/request',requestEmailVerification);

authRouter.post('/email/verification/confirm',confirmEmailVerification);




export {authRouter};