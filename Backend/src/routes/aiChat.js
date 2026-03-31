const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/usermiddleware");
const solveDoubt = require('../controllers/solvedoubt');

aiRouter.post('/chat', userMiddleware, solveDoubt);

module.exports = aiRouter;