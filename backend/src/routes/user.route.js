import {Router} from 'express';
import { createUser, me, updateUser } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { uploadAvatarImage } from '../middlewares/multer.middleware.js';

const userRouter=Router();



userRouter.post('/create',createUser);

userRouter.post('/update',isAuthenticated,uploadAvatarImage.single('avatar'),updateUser);

userRouter.get('/me',isAuthenticated,me);

export {userRouter};