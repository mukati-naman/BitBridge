// testJudge.js
const { getLanguageByID, submitBatch, pollBatch } = require("./judge-debug");
const rapidApiKey = "PUT_YOUR_RAPIDAPI_KEY_HERE";

(async () => {
  try {
    console.log("language IDs: cpp->", getLanguageByID("cpp"), "js->", getLanguageByID("javascript"));

    const submissions = [
      {
        language_id: getLanguageByID("javascript"),
        source_code: "const fs = require('fs'); const input = fs.readFileSync(0,'utf8').trim().split(' '); const a = parseInt(input[0]||0); const b = parseInt(input[1]||0); console.log(a-b);",
        stdin: "5 3"
      }
    ];

    if (!submissions[0].language_id) {
      console.error("language_id resolved to null/undefined. Check getLanguageByID mapping.");
      return;
    }

    
    const submitRes = await submitBatch(submissions, rapidApiKey);
    console.log("submitRes:", JSON.stringify(submitRes, null, 2));

   
    const tokens = submitRes.tokens || (submitRes.submissions && submitRes.submissions.map(s => s.token)) || submitRes.map?.(t=>t.token) || [];
    if (!tokens || tokens.length === 0) {
      console.error("No tokens received. Full submitRes:", JSON.stringify(submitRes, null, 2));
      return;
    }
    console.log("tokens:", tokens);

   
    const results = await pollBatch(tokens, rapidApiKey, 1000, 30);
    console.log("Final results:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("TEST ERROR:", err && err.message ? err.message : err);
    console.error(err.stack || "");
  }
})();
