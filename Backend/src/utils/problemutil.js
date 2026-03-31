const axios = require("axios");

const getLanguagebyID = (lang) => {
  const language = {
    "cpp": 54,
    "c++": 54,
    "java": 62,
    "javascript": 63
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const response = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions/batch",
    { submissions },
    {
      params: { base64_encoded: "false" },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};

const submitToken = async (tokens) => {
  while (true) {
    const response = await axios.get(
      "https://judge0-ce.p.rapidapi.com/submissions/batch",
      {
        params: {
          tokens: tokens.join(","),
          fields: "*"
        },
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com"
        }
      }
    );

    const result = response.data.submissions;

    const done = result.every((r) => r.status.id > 2);

    if (done) return result;

    await new Promise((r) => setTimeout(r, 1000));
  }
};

module.exports = { getLanguagebyID, submitBatch, submitToken };