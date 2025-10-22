export default function UploadRecord() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload Record</h1>
      <input type="file" className="mb-4" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload
      </button>
    </div>
  );
}
