import { Router } from "express";
import { userController } from "../controllers/userController";

const router = Router();

router.post("/", userController.registerUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserEmail);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.loginUser);
export default router;
