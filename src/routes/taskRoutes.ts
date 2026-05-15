import { Router } from "express";
import { taskController } from "../controllers/taskController";
import { authenticateToken } from "../middlewares/authentication";
const router = Router();

router.get("/", authenticateToken, taskController.getAllTasks);
router.get("/:id", authenticateToken, taskController.getTaskById);
router.post("/", authenticateToken, taskController.createTask);
router.put("/:id", authenticateToken, taskController.updateTask);
router.delete("/:id", authenticateToken, taskController.deleteTask);

export default router;
