export default function Profile() {
  const mockProfile = {
    name: "John Doe",
    dob: "1990-01-01",
    bloodGroup: "O+",
    allergies: "None",
    chronic: "Hypertension"
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white p-6 shadow rounded-lg w-96">
        <p><strong>Name:</strong> {mockProfile.name}</p>
        <p><strong>DOB:</strong> {mockProfile.dob}</p>
        <p><strong>Blood Group:</strong> {mockProfile.bloodGroup}</p>
        <p><strong>Allergies:</strong> {mockProfile.allergies}</p>
        <p><strong>Chronic Conditions:</strong> {mockProfile.chronic}</p>
      </div>
    </div>
  );
}
