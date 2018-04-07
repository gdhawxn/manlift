import express from 'express';
let router = express.Router();

import adminRoutes from './admin' ;

//auth routes
router.use('/' , adminRoutes)

export default router;
