import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


const isAuthenticated = asyncHandler(async (req, res, next) => {


    next();
});


const isAuthorised = () =>
    asyncHandler(async (req, res, next) => {


        next();
    });

