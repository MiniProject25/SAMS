import { Router } from "express";
import { addAsset, getAssets } from "./controllers/assetController.js";
import verifyUser from "../users/controller/userAuthMiddleware.js";
import { getDashboardSummary } from "./controllers/analyticsController.js";

const router = Router();

router.post('/add', verifyUser, addAsset);
router.get('', verifyUser, getAssets);
router.get('/analysis', verifyUser ,getDashboardSummary);

export default router;