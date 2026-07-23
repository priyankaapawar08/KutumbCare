import { useState } from "react";
import { addVitalSign } from "../../services/vitalsService";

export default function AddVitals({ memberId, onSuccess }: any) {
  const [vitalType, setVitalType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await addVitalSign({
        memberId,
        vitalType: vitalType as any,
        value: {
          measurement: Number(value),
          unit: unit || ""
        },
        time
      });

      if (res.success) {
        alert("✅ Vital added");
        setVitalType("");
        setValue("");
        setUnit("");
        setTime("");
        onSuccess(); // reload list
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add vital");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add Vital</h2>

      <input
        placeholder="Type (blood_pressure, temperature...)"
        value={vitalType}
        onChange={(e) => setVitalType(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        placeholder="Unit (mmHg, °C...)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <input
        placeholder="Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2">
        Add
      </button>
    </div>
  );
}