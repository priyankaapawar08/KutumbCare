// frontend/src/components/LifestylePredictor.tsx
import { useState } from "react";
import axios from "axios";

export default function LifestylePredictor() {
  const [sex, setSex] = useState("Male");
  const [diet, setDiet] = useState("Vegetarian");
  const [activity, setActivity] = useState("Moderate");
  const [addiction, setAddiction] = useState("None");

  const [result, setResult] = useState<{ prediction: string; confidence: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post("/lifestyle-predict", {
        sex,
        diet,
        activity,
        addiction
      });
      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow-md w-full max-w-md mx-auto my-4">
      <h2 className="text-xl font-semibold mb-4">Lifestyle Predictor</h2>

      {/* Form Inputs */}
      <div className="space-y-2">
        <label>
          Sex:
          <select value={sex} onChange={(e) => setSex(e.target.value)} className="ml-2 border px-2 py-1">
            <option>Male</option>
            <option>Female</option>
          </select>
        </label>

        <label>
          Diet:
          <select value={diet} onChange={(e) => setDiet(e.target.value)} className="ml-2 border px-2 py-1">
            <option>Vegetarian</option>
            <option>Non-Vegetarian</option>
            <option>Vegan</option>
          </select>
        </label>

        <label>
          Physical Activity:
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="ml-2 border px-2 py-1">
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
          </select>
        </label>

        <label>
          Addiction:
          <select value={addiction} onChange={(e) => setAddiction(e.target.value)} className="ml-2 border px-2 py-1">
            <option>None</option>
            <option>Smoking</option>
            <option>Alcohol</option>
          </select>
        </label>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div className="mt-4 p-3 border rounded bg-green-50">
          <p><strong>Lifestyle:</strong> {result.prediction}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
  
}
