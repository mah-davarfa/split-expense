import express from 'express'
import authToken from '../middlewares/auth.js';
import {aiAssistant} from '../controllers/aiController.js';

const router =express.Router();

//POST /api/ai/assistant
router.post('/assistant',authToken,aiAssistant);

export default router;