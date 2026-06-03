import { Router } from "express";
import { authController } from "../controllers/authController";
import { loginRateLimiter, registerRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/register", registerRateLimiter, authController.registerUser);
router.post("/login", loginRateLimiter, authController.loginUser);

export default router;
