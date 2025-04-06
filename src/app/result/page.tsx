"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const scenario = searchParams.get("scenario");
  const result = searchParams.get("result");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Your Result</h2>

        {scenario && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Your Scenario:</h3>
            <p className="text-gray-600 dark:text-gray-400">{scenario}</p>
          </div>
        )}

        {result ? (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">AI's Verdict:</h3>
            <p className="text-gray-900 dark:text-gray-100">{result}</p>
          </div>
        ) : (
          <p className="mt-4 text-center text-red-500 font-medium">No result found.</p>
        )}

        <button
          onClick={() => router.push("/features/delulu-analyzer")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
