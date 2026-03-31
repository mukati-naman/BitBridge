
const axios = require("axios");

// --- language map (Judge0 CE RapidAPI)
const getLanguageByID = (lang) => {
  if (!lang || typeof lang !== "string") return null;
  const map = {
    cpp: 76,
    "c++": 76,
    java: 91,
    javascript: 93,
    js: 93,
    python: 71,
    python3: 71,
  };
  return map[lang.trim().toLowerCase()] ?? null;
};


const submitBatch = async (submissions, rapidApiKey) => {
  console.log("submitBatch called. submissions:", JSON.stringify(submissions, null, 2));

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: { base64_encoded: "false", wait: "false" },
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions },
    timeout: 30000,
  };

  try {
    const res = await axios.request(options);
    console.log("submitBatch - response status:", res.status);
    console.log("submitBatch - data:", JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("submitBatch - HTTP error:", err.response.status, err.response.data);
      throw new Error(`submitBatch HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error("submitBatch - Network/Error:", err.message);
      throw err;
    }
  }
};


const pollBatch = async (tokens, rapidApiKey, pollInterval = 1000, maxAttempts = 60) => {
  console.log("pollBatch called. tokens:", tokens);

  const url = "https://judge0-ce.p.rapidapi.com/submissions/batch";
  const headers = {
    "x-rapidapi-key": rapidApiKey,
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  };

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;

    try {
      const res = await axios.get(url, {
        params: { tokens: tokens.join(","), base64_encoded: "false", fields: "*" },
        headers,
        timeout: 20000,
      });

      console.log(`pollBatch attempt ${attempt} - HTTP ${res.status}`);

      const subs = res.data.submissions;
      subs.forEach((s, i) => {
        console.log(` submission[${i}]: status=${s.status?.id ?? s.status_id}, language=${JSON.stringify(s.language)}`);
      });

      const allDone = subs.every((s) => (s.status?.id ?? s.status_id) > 2);
      if (allDone) return subs;

      await new Promise((r) => setTimeout(r, pollInterval));
    } catch (err) {
      console.error("pollBatch error:", err.message || err);
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  }

  throw new Error("pollBatch: Max attempts reached");
};

module.exports = { getLanguageByID, submitBatch, pollBatch };
