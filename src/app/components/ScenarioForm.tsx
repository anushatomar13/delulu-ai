import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function CrushScenarioForm() {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const router = useRouter(); 

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/result?scenario=${encodeURIComponent(scenario)}&result=${encodeURIComponent(data.message)}`);
      } else {
        setResponse("Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      setResponse("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Delulu or Not?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded-lg"
          rows={4}
          placeholder="Type your crush scenario..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Check Now"}
        </button>
      </form>
      {response && <p className="mt-4 text-center text-gray-700">{response}</p>}
    </div>
  );
}
