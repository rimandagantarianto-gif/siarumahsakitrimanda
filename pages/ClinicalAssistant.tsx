import React, { useState } from 'react';
import { summarizeClinicalNote } from '../services/geminiService';
import { Patient } from '../types';

// Mock Patient Data (FHIR-like)
const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'P001', 
    resourceType: 'Patient', 
    name: [{ use: 'official', family: 'Santoso', given: ['Budi'] }],
    gender: 'male',
    birthDate: '1980-05-12',
    identifier: [{ system: 'nik', value: '320101010101' }]
  },
  { 
    id: 'P002', 
    resourceType: 'Patient', 
    name: [{ use: 'official', family: 'Wijaya', given: ['Siti', 'Amina'] }],
    gender: 'female',
    birthDate: '1992-11-20',
    identifier: [{ system: 'nik', value: '320202020202' }]
  }
];

const ClinicalAssistant: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGenerateSummary = async () => {
    if (!noteInput.trim()) return;
    
    setIsProcessing(true);
    setGeneratedSummary('');
    
    try {
      const summary = await summarizeClinicalNote(noteInput);
      setGeneratedSummary(summary);
    } catch (e) {
      setGeneratedSummary("Failed to generate summary.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple filtering (Vertex AI Search would be server-side in real app)
  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name[0].family.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name[0].given.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Patient List (Left Column) */}
      <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Patient Directory (FHIR)</h3>
          <input 
            type="text" 
            placeholder="Search Name or MRN..." 
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-3 rounded-md cursor-pointer mb-2 border transition-colors ${selectedPatient?.id === patient.id ? 'bg-teal-50 border-teal-500' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{patient.name[0].family}, {patient.name[0].given.join(' ')}</p>
                  <p className="text-xs text-gray-500">DOB: {patient.birthDate} ({patient.gender})</p>
                </div>
                <span className="text-xs font-mono bg-gray-100 px-1 rounded">{patient.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace (Right 2 Columns) */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
        {!selectedPatient ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a patient to begin documentation.
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Patient Header */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedPatient.name[0].given.join(' ')} {selectedPatient.name[0].family}
                </h2>
                <p className="text-sm text-gray-500">Resource: Patient/FHIR-R4/{selectedPatient.id}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">View History</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">Vitals</button>
              </div>
            </div>

            {/* AI Assistant Workspace */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Transcript / Rough Notes
                </label>
                <textarea 
                  className="w-full h-40 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  placeholder="Paste raw transcript or type notes here... e.g., 'Patient complains of headache for 3 days, bp 120/80, recommend rest and paracetamol'"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    <span className="mr-1">🔒</span> 
                    PHI is encrypted in transit. Do not enter extremely sensitive data in this demo.
                  </span>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isProcessing || !noteInput}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-white font-medium transition-colors ${isProcessing || !noteInput ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-yellow-600'}`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Generate AI Summary
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Area */}
              {generatedSummary && (
                <div className="mt-6 border border-teal-200 bg-teal-50 rounded-md p-4 relative animate-fade-in">
                  <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs px-2 py-1 rounded-bl rounded-tr">
                    Gemini 2.5 Flash
                  </div>
                  <h4 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    AI Draft Suggestion
                  </h4>
                  <div className="prose prose-sm text-gray-700 whitespace-pre-line max-w-none">
                    {generatedSummary}
                  </div>
                  <div className="mt-4 pt-4 border-t border-teal-200 flex justify-end gap-3">
                    <button className="text-xs text-gray-500 hover:text-red-500">Discard</button>
                    <button className="text-xs font-bold text-teal-700 hover:text-teal-900 border border-teal-700 px-3 py-1 rounded">Copy to RME</button>
                  </div>
                  
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong>Mandatory Review:</strong> This text was generated by AI. You must verify its accuracy before saving to the permanent medical record.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalAssistant;