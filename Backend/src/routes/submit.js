const express = require('express');
const submitRouter = express.Router();
const usermiddleware = require('../middleware/usermiddleware');

const { submitCode, runCode } = require("../controllers/usersubmission");
const Submission = require("../models/submission");

submitRouter.get("/history/:id", usermiddleware, async (req, res) => {
    try {
        const userID = req.result._id;
        const problemId = req.params.id;

        const submissions = await Submission.find({
            userID,
            problemId
        }).sort({ createdAt: -1 });

        res.status(200).send(submissions); 

    } catch (err) {
       
        res.status(500).send("Error fetching submissions");
    }
});

submitRouter.post("/submit/:id", usermiddleware, submitCode);
submitRouter.post("/run/:id", usermiddleware, runCode);

module.exports = submitRouter;