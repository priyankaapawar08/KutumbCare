// Format a date to "DD MMM YYYY" e.g., "01 Oct 2025"
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Format time to "HH:MM AM/PM" e.g., "02:30 PM"
export function formatTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Format a number with commas e.g., 1200 -> "1,200"
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString();
}

// Capitalize the first letter of a string
export function capitalize(text: string | null | undefined): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Format blood pressure e.g., {systolic: 120, diastolic: 80} -> "120/80 mmHg"
export function formatBloodPressure(systolic: number, diastolic: number): string {
  if (!systolic && !diastolic) return "-";
  return `${systolic}/${diastolic} mmHg`;
}

// Format weight e.g., 70 -> "70 kg"
export function formatWeight(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} kg`;
}

// Format height e.g., 175 -> "175 cm"
export function formatHeight(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} cm`;
}

// Format glucose e.g., 90 -> "90 mg/dL"
export function formatGlucose(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} mg/dL`;
}
