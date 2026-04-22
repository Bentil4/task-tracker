import { Router } from "express";
import { userController } from "../controllers/userController";

const router = Router();

router.post("/", userController.registerUser);
router.get("/", userController.getAllUsers);
export default router;
