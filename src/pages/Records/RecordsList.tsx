export default function RecordsList() {
  const mockRecords = [
    { type: "Prescription", date: "2025-09-01" },
    { type: "Lab Report", date: "2025-09-05" }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Medical Records</h1>
      <div className="bg-white p-4 shadow rounded-lg w-96">
        {mockRecords.map((record, i) => (
          <div key={i} className="flex justify-between mb-2 border-b pb-1">
            <span>{record.type}</span>
            <span>{record.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
