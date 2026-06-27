export interface Prisoner {
  id: string;
  name: string;
  dob: string; // dd-mm-yyyy
  address: string;
  status: 'active' | 'disciplined';
  reason?: string;
}

export interface Visit {
  id: string;
  stt: string; // e.g. "001", "002"
  visitorName: string;
  visitorGender: 'Nam' | 'Nữ';
  visitorDob: string;
  visitorCccd: string;
  visitorPhone: string;
  relationship: string;
  prisonerId?: string;
  prisonerName: string;
  prisonerDob: string;
  visitDate: string;
  createdAt: string;
  status: 'waiting' | 'checked-in' | 'cancelled';
}

export interface SystemSettings {
  scriptUrl: string;
  visitDate: string; // e.g., "30/06/2026"
  bypassAppsScript: boolean; // default true so it works flawlessly out-of-the-box
  maxVisitsPerDay: number;
}
