import express from 'express'
import authController from "../controllers/authController.js";
import {verifyToken} from "../middleware/verifyToken.js"; 

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refreshAccessToken);
router.post("/edit", verifyToken, authController.editUser);

export default router;
