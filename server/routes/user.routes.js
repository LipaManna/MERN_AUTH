import express from "express";
import { getUserData } from "../controllers/user.controller.js";
import userAuth from "../middleware/userauth.middleware.js";

const userRouter = express.Router();

userRouter.get("/get-user-data", userAuth, getUserData);    

export default userRouter;