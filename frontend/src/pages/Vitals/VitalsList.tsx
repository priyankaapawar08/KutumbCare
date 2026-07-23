import { useEffect, useState } from "react";
import { getVitalsByMember } from "../../services/vitalsService";

export default function VitalsList({ memberId }: any) {
  const [vitals, setVitals] = useState<any[]>([]);

  const loadVitals = async () => {
    const res = await getVitalsByMember(memberId);
    if (res.success) {
      setVitals(res.vitals || []);
    }
  };

  useEffect(() => {
    if (memberId) loadVitals();
  }, [memberId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Vitals</h2>

      {vitals.length === 0 ? (
        <p>No vitals found</p>
      ) : (
        <ul>
          {vitals.map((v: any) => (
            <li key={v._id}>
              {v.vitalType} - {v.value?.measurement} {v.value?.unit} (
              {new Date(v.date).toLocaleDateString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}