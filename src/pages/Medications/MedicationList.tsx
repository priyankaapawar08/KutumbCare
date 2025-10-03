export default function AddMedication() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Add Medication</h1>
      <input type="text" placeholder="Medication Name" className="mb-2 p-2 border rounded w-80" />
      <input type="text" placeholder="Dose" className="mb-2 p-2 border rounded w-80" />
      <input type="text" placeholder="Frequency" className="mb-2 p-2 border rounded w-80" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
    </div>
  );
}
