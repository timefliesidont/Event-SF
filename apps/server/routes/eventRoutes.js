import { Router } from "express";
import { createEvent, getOrganizerEvents, getAllEvents, getMyEvents, getEventById, deleteEvent } from "../controllers/eventController.js";
import {verifyToken} from "../middleware/verifyToken.js"; 
import {checkRole} from "../middleware/checkRole.js"; 
import { joinEvent as joinEventController } from "../controllers/eventController.js";

const router = Router();

router.get("/organizer", verifyToken, checkRole("organizer"), getOrganizerEvents);
router.get("/participant/all", verifyToken, checkRole("participant"), getAllEvents);
router.get("/participant/myevents", verifyToken, checkRole("participant"), getMyEvents);
router.get("/:eventId", getEventById); 
router.post("/create", verifyToken, checkRole("organizer"), createEvent);
router.post("/:eventId/join", verifyToken, checkRole("participant"), joinEventController);
router.delete("/:eventId", verifyToken, checkRole("organizer"), deleteEvent);
export default router;
