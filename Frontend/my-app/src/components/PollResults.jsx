import React from "react";

export default function PollResults({ results }) {
  if (!results || Object.keys(results).length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Results</h3>
      {Object.keys(results).map((opt, i) => (
        <div key={i} className="mb-2">
          {/* <span>{opt}: {results[opt].toFixed(1)}%</span> */}
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-500 h-4 rounded"
              style={{ width: `${results[opt]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}