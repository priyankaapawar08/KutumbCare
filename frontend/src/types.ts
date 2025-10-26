// frontend/src/types.ts
export interface FamilyMember {
  _id: string;
  name: string;
  relation: string;
  age: number;
}

export interface Appointment {
  _id: string;
  member: FamilyMember;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}
