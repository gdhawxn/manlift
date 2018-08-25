import express from 'express';
let router = express.Router();

import adminRoutes from './admin' ;

//auth routes
router.use('/' , adminRoutes)
router.use('/practiice/' , adminRoutes);

export default router;
