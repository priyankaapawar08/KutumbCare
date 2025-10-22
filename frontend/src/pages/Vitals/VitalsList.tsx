export default function VitalsList() {
  const mockVitals = [
    { type: "BP", value: "120/80", date: "2025-09-30" },
    { type: "Glucose", value: "90 mg/dL", date: "2025-09-30" }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Vitals</h1>
      <ul className="bg-white p-4 shadow rounded-lg w-96">
        {mockVitals.map((vital, i) => (
          <li key={i} className="mb-2 border-b pb-1">
            {vital.type}: {vital.value} ({vital.date})
          </li>
        ))}
      </ul>
    </div>
  );
}
