import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticateToken, requireRole } from "../middlewares/authentication";
import { UserRole } from "../types/user";

const router = Router();

router.use(authenticateToken);

router.get("/", requireRole([UserRole.ADMIN]), userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserEmail);
router.delete("/:id", requireRole([UserRole.ADMIN]), userController.deleteUser);

export default router;
