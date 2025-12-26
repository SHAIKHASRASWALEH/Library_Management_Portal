import { Router } from 'express';
import { googleCallback, googleLogin } from '../controllers/auth_google.controller.js';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

router.get('/google/callback', googleCallback);
router.post('/google/callback', googleCallback);
router.post('/google', googleLogin);
export default router;
