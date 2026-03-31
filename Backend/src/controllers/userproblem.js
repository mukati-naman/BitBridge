const { getLanguagebyID, submitBatch, submitToken } = require("../utils/problemutil");
const Problem = require("../models/problems");
const User = require("../models/user");
const Submission = require("../models/submission");
const solutionVideo = require("../models/solutionVideo");

const createproblem = async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution
    } = req.body;

    try {

        if (!referenceSolution || !Array.isArray(referenceSolution)) {
            return res.status(400).send("referenceSolution missing or invalid");
        }

        for (const { language, completeCode } of referenceSolution) {

            const languageID = getLanguagebyID(language);

            if (!languageID) {
                return res.status(400).send("Invalid language");
            }

            const submissions = visibleTestCases.map((testcases) => ({
                source_code: completeCode,
                language_id: languageID,
                stdin: testcases.input,
                expected_output: testcases.output
            }));

            const submitresult = await submitBatch(submissions);

            if (!submitresult) {
                return res.status(500).send("Judge0 submission failed");
            }

            const resulttoken = submitresult.map((value) => value.token);

            const testResult = await submitToken(resulttoken);

            if (!testResult) {
                return res.status(500).send("Judge0 result fetch failed");
            }

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Reference solution failed test cases");
                }
            }
        }

        const userProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.result._id
        });

        res.status(201).send(userProblem);

    } catch (err) {
        console.log("🔥 ERROR:", err);
        res.status(500).send("Error: " + err.message);
    }
};


const updateproblem = async (req, res) => {
    const { id } = req.params;

    const {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution
    } = req.body;

    try {
        if (!id) {
            return res.status(400).send("Missing ID");
        }

        const existing = await Problem.findById(id);
        if (!existing) {
            return res.status(404).send("Problem not found");
        }

        if (!referenceSolution || !Array.isArray(referenceSolution)) {
            return res.status(400).send("referenceSolution invalid");
        }

        for (const { language, completeCode } of referenceSolution) {

            const languageID = getLanguagebyID(language);

            const submissions = visibleTestCases.map((testcases) => ({
                source_code: completeCode,
                language_id: languageID,
                stdin: testcases.input,
                expected_output: testcases.output
            }));

            const submitresult = await submitBatch(submissions);
            const tokens = submitresult.map((v) => v.token);

            const testResult = await submitToken(tokens);

            if (!testResult || testResult.length === 0) {
                return res.status(400).send("No test results");
            }

            for (const test of testResult) {
                const statusId = test.status?.id;

                if (statusId !== 3) {
                    return res.status(400).send("Reference solution failed");
                }
            }
        }

        const updated = await Problem.findByIdAndUpdate(
            id,
            {
                title,
                description,
                difficulty,
                tags,
                visibleTestCases,
                hiddenTestCases,
                startCode,
                referenceSolution
            },
            { new: true, runValidators: true }
        );

        res.status(200).send(updated);

    } catch (err) {
        console.log("🔥 ERROR:", err);
        res.status(500).send("Error: " + err.message);
    }
};


const deleteproblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send("ID missing");

        const deleted = await Problem.findByIdAndDelete(id);

        if (!deleted) return res.status(404).send("Problem not found");

        res.status(200).send("Deleted successfully");

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};


const getproblembyID = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send("ID missing");

        const problem = await Problem.findById(id).select(
            "_id title description difficulty tags visibleTestCases startCode"
        );

        if (!problem) return res.status(404).send("Problem not found");

        const videos = await solutionVideo.findOne({ problemId: id });

        if (videos) {
            return res.status(200).send({
                ...problem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration
            });
        }

        res.status(200).send(problem);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};


const getallproblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select("_id title difficulty tags");

        if (problems.length === 0) {
            return res.status(404).send("No problems found");
        }

        res.status(200).send(problems);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};


const solvedProblembyuser = async (req, res) => {
    try {
        const userID = req.result._id;

        const user = await User.findById(userID).populate({
            path: "problemSolved",
            select: "_id difficulty title tags"
        });

        res.status(200).send(user.problemSolved);

    } catch (err) {
        res.status(500).send("Error");
    }
};



const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const submissions = await Submission.find({ userID: userId, problemId });

        if (!submissions || submissions.length === 0) {
            return res.status(200).send([]);
        }

        res.status(200).send(submissions);

    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    createproblem,
    updateproblem,
    deleteproblem,
    getproblembyID,
    getallproblem,
    solvedProblembyuser,
    submittedProblem
};