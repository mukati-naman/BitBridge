import { useEffect, useState } from "react";
import axiosClient from "../utils/axioxclient";

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosClient.get(
          `/submission/history/${problemId}`,
          {
            withCredentials: true 
          }
        );

        console.log("API RESPONSE:", response.data);

        if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else if (Array.isArray(response.data?.submissions)) {
          setSubmissions(response.data.submissions);
        } else {
          setSubmissions([]);
        }

      } catch (error) {
        console.error("Error fetching submissions:", error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  if (loading) {
    return <p className="text-gray-500">Loading submissions...</p>;
  }

  if (!submissions || submissions.length === 0) {
    return <p className="text-gray-500">No submissions yet</p>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const isAccepted = sub.status === "accepted";

        return (
          <div
            key={sub._id}
            className="border border-base-300 p-4 rounded-lg shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                Status:{" "}
                <span
                  className={
                    isAccepted ? "text-green-500" : "text-red-500"
                  }
                >
                  {isAccepted ? "Accepted ✅" : "Wrong ❌"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {sub.createdAt
                  ? new Date(sub.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            {/* DETAILS */}
            <div className="mt-2 text-sm space-y-1">
              <p>
                Test Cases:{" "}
                {sub.testcasespassed ?? 0} / {sub.testCasestotal ?? 0}
              </p>

              <p>
                Runtime:{" "}
                {sub.runtime ? `${sub.runtime.toFixed(3)} sec` : "0 sec"}
              </p>

              <p>
                Memory:{" "}
                {sub.memory ? `${sub.memory} KB` : "0 KB"}
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {sub.errorMessage && (
              <div className="mt-2 text-red-500 text-sm bg-red-100 p-2 rounded">
                <strong>Error:</strong> {sub.errorMessage}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionHistory;