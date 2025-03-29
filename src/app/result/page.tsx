"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const scenario = searchParams.get("scenario");
  const result = searchParams.get("result");

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Your Result</h2>

      {scenario && (
        <div className="mb-4">
          <h3 className="font-semibold">Your Scenario:</h3>
          <p className="text-gray-700">{scenario}</p>
        </div>
      )}

      {result ? (
        <div className="p-3 bg-gray-100 rounded-md">
          <h3 className="font-semibold">AI's Verdict:</h3>
          <p className="text-gray-900">{result}</p>
        </div>
      ) : (
        <p className="text-red-500">No result found.</p>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
}
