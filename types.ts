// Financial Types
export interface FinancialItem {
  id: string;
  category: string;
  name: string;
  amountCurrent: number;
  amountPrevious: number;
}

export interface Receivable {
  id: string;
  payerName: string;
  amount: number;
  ageMonths: number;
  status: 'Unpaid' | 'Paid';
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  postedBy: string;
}

export interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
}

// FHIR / Clinical Types (Simplified for Prototype)
export interface Patient {
  id: string;
  resourceType: 'Patient';
  name: {
    use: string;
    family: string;
    given: string[];
  }[];
  gender: 'male' | 'female';
  birthDate: string;
  identifier: {
    system: string;
    value: string;
  }[];
}

export interface Encounter {
  id: string;
  resourceType: 'Encounter';
  status: 'finished' | 'planned';
  class: {
    code: string;
  };
  subject: {
    reference: string;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface ClinicalNote {
  rawText: string;
  summary?: string;
  lastUpdated: string;
}

export type Role = 'admin' | 'accountant' | 'doctor';