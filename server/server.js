import express from "express";
import dotenv from "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.routes.js";

const app = express();

const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(express.json());
app.use(cors({origin: allowedOrigins,credentials:true}));
app.use(cookieParser());

//API ENDPOINTS
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
    res.send("Hello World 2.0!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

