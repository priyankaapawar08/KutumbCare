export default function MedicationList() {
  const mockMeds = [
    { name: "Paracetamol", dose: "500mg", frequency: "2/day" },
    { name: "Vitamin C", dose: "1000mg", frequency: "1/day" }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Medications</h1>
      <ul className="bg-white p-4 shadow rounded-lg w-96">
        {mockMeds.map((med, i) => (
          <li key={i} className="mb-2 border-b pb-1">
            {med.name} - {med.dose} ({med.frequency})
          </li>
        ))}
      </ul>
    </div>
  );
}
