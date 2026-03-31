const Problem = require("../models/problems");
const Submission = require("../models/submission");
const { submitBatch, submitToken } = require("../utils/problemutil");

const languageMapReverse = {
  54: "cpp",
  62: "java",
  63: "javascript"
};

const submitCode = async (req, res) => {
  try {
    if (!req.result) {
      return res.status(401).send("User not authenticated");
    }

    const userID = req.result._id;
    const problemId = req.params.id;
    const { code, language_id } = req.body;

    console.log("DEBUG:", { userID, code, problemId, language_id });

    if (!userID || !code || !problemId || !language_id) {
      return res.status(400).send("some field missing");
    }

    if (!languageMapReverse[language_id]) {
      return res.status(400).send("Invalid language_id");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      return res.status(400).send("No hidden test cases found");
    }

    const submittedresult = await Submission.create({
      userID,
      problemId,
      code,
      language: languageMapReverse[language_id],
      language_id,
      status: "pending",
      testCasestotal: problem.hiddenTestCases.length
    });

    const submissions = problem.hiddenTestCases.map((t) => ({
      source_code: code,
      language_id,
      stdin: t.input,
      expected_output: t.output
    }));

    console.log("SUBMISSIONS:", submissions);

    const submitresult = await submitBatch(submissions);
    console.log("SUBMIT RESULT:", submitresult);

    if (!submitresult || !Array.isArray(submitresult)) {
      return res.status(500).send("Judge0 submission failed");
    }

    const resulttoken = submitresult.map((value) => value.token);

    const testResult = await submitToken(resulttoken);
    console.log("TEST RESULT:", testResult);

    if (!testResult || !Array.isArray(testResult)) {
      return res.status(500).send("Judge0 result fetch failed");
    }

    let passed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      const statusId = test.status?.id || test.status_id;

      if (statusId === 3) {
        passed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = statusId === 4 ? "error" : "wrong";
        errorMessage =
          test.stderr ||
          test.compile_output ||
          test.message ||
          "Unknown error";
      }
    }

    if (passed !== testResult.length) {
      status = "wrong";
    }

    submittedresult.testcasespassed = passed;
    submittedresult.status = status;
    submittedresult.runtime = runtime;
    submittedresult.memory = memory;
    submittedresult.errorMessage = errorMessage;

    await submittedresult.save();

    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).send(submittedresult);

  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const runCode = async (req, res) => {
  try {
    if (!req.result) {
      return res.status(401).send("User not authenticated");
    }

    const userID = req.result._id;
    const problemId = req.params.id;
    const { code, language_id } = req.body;

    if (!userID || !code || !problemId || !language_id) {
      return res.status(400).send("some field missing");
    }

    const problem = await Problem.findById(problemId);

    if (!problem || !problem.visibleTestCases) {
      return res.status(400).send("No test cases");
    }

    const submissions = problem.visibleTestCases.map((t) => ({
      source_code: code,
      language_id,
      stdin: t.input,
      expected_output: t.output
    }));

    const submitresult = await submitBatch(submissions);

    if (!submitresult || !Array.isArray(submitresult)) {
      return res.status(500).send("Judge0 submission failed");
    }

    const tokens = submitresult.map((v) => v.token);

    const result = await submitToken(tokens);

    res.status(201).send(result);

  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitCode, runCode };