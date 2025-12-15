import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialItem, Receivable, JournalEntry, Account } from '../types';

// Mock Data
const MOCK_BALANCE_SHEET: FinancialItem[] = [
  { id: '1', category: 'Assets', name: 'Cash & Cash Equivalents', amountCurrent: 1500000000, amountPrevious: 1200000000 },
  { id: '2', category: 'Assets', name: 'Short Term Investments', amountCurrent: 500000000, amountPrevious: 300000000 },
  { id: '3', category: 'Assets', name: 'Accounts Receivable (Net)', amountCurrent: 750000000, amountPrevious: 800000000 },
  { id: '4', category: 'Liabilities', name: 'Short Term Debt', amountCurrent: 200000000, amountPrevious: 250000000 },
  { id: '5', category: 'Equity', name: 'Net Assets', amountCurrent: 2550000000, amountPrevious: 2050000000 },
];

const MOCK_ACTIVITY: FinancialItem[] = [
  { id: 'a1', category: 'Revenue', name: 'Service Revenue (BLU)', amountCurrent: 5000000000, amountPrevious: 4800000000 },
  { id: 'a2', category: 'Revenue', name: 'APBN Grant', amountCurrent: 1000000000, amountPrevious: 1000000000 },
  { id: 'a3', category: 'Expense', name: 'Personnel Expenses', amountCurrent: 2500000000, amountPrevious: 2400000000 },
  { id: 'a4', category: 'Expense', name: 'Operational Supplies', amountCurrent: 1200000000, amountPrevious: 1100000000 },
  { id: 'a5', category: 'Expense', name: 'Depreciation', amountCurrent: 300000000, amountPrevious: 280000000 },
];

const MOCK_RECEIVABLES: Receivable[] = [
  { id: 'r1', payerName: 'BPJS Kesehatan', amount: 500000000, ageMonths: 2, status: 'Unpaid' },
  { id: 'r2', payerName: 'Insurer A', amount: 100000000, ageMonths: 7, status: 'Unpaid' }, // 50% provision
  { id: 'r3', payerName: 'General Patient X', amount: 20000000, ageMonths: 13, status: 'Unpaid' }, // 100% provision
  { id: 'r4', payerName: 'Ministry of Health', amount: 300000000, ageMonths: 1, status: 'Unpaid' },
];

const ACCOUNT_CHART: Account[] = [
  { code: '1101', name: 'Kas (Cash)', type: 'Asset' },
  { code: '1102', name: 'Piutang Pelayanan (AR)', type: 'Asset' },
  { code: '1201', name: 'Persediaan Obat (Inventory)', type: 'Asset' },
  { code: '2101', name: 'Utang Usaha (AP)', type: 'Liability' },
  { code: '4101', name: 'Pendapatan Layanan (BLU Revenue)', type: 'Revenue' },
  { code: '4201', name: 'Pendapatan APBN', type: 'Revenue' },
  { code: '5101', name: 'Beban Pegawai', type: 'Expense' },
  { code: '5201', name: 'Beban Persediaan/Obat', type: 'Expense' },
  { code: '5301', name: 'Beban Operasional Lainnya', type: 'Expense' },
];

const INITIAL_ENTRIES: JournalEntry[] = [
  { id: 'j1', date: '2023-10-01', description: 'Pembayaran BPJS cair', reference: 'REF-001', debitAccount: '1101', creditAccount: '1102', amount: 250000000, postedBy: 'Admin' },
  { id: 'j2', date: '2023-10-02', description: 'Pembelian Obat', reference: 'INV-992', debitAccount: '1201', creditAccount: '1101', amount: 50000000, postedBy: 'Admin' },
];

const FinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'activity' | 'receivables' | 'entry'>('balance');
  const [transactions, setTransactions] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  
  // Form State
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    debitAccount: '',
    creditAccount: '',
    amount: ''
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.debitAccount || !entryForm.creditAccount || !entryForm.amount) return;
    if (entryForm.debitAccount === entryForm.creditAccount) {
      alert("Debit and Credit accounts must be different.");
      return;
    }

    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: entryForm.date,
      description: entryForm.description,
      reference: entryForm.reference || '-',
      debitAccount: entryForm.debitAccount,
      creditAccount: entryForm.creditAccount,
      amount: parseFloat(entryForm.amount),
      postedBy: 'Current User'
    };

    setTransactions([newEntry, ...transactions]);
    setEntryForm({ ...entryForm, description: '', reference: '', amount: '' }); // Reset fields
  };

  // Logic for BLU Receivables Provision (Penyisihan Piutang)
  const receivablesAnalysis = useMemo(() => {
    let totalReceivable = 0;
    let totalProvision = 0;

    const analyzed = MOCK_RECEIVABLES.map(item => {
      let provisionRate = 0;
      if (item.ageMonths > 12) provisionRate = 1.0;
      else if (item.ageMonths > 6) provisionRate = 0.5;
      
      const provisionAmount = item.amount * provisionRate;
      
      totalReceivable += item.amount;
      totalProvision += provisionAmount;

      return { ...item, provisionRate, provisionAmount };
    });

    return { items: analyzed, totalReceivable, totalProvision, netReceivable: totalReceivable - totalProvision };
  }, []);

  // Logic for Single Step Activity Report
  const activitySummary = useMemo(() => {
    const revenue = MOCK_ACTIVITY.filter(i => i.category === 'Revenue').reduce((acc, curr) => acc + curr.amountCurrent, 0);
    const expense = MOCK_ACTIVITY.filter(i => i.category === 'Expense').reduce((acc, curr) => acc + curr.amountCurrent, 0);
    return { revenue, expense, surplus: revenue - expense };
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const getAccountName = (code: string) => ACCOUNT_CHART.find(a => a.code === code)?.name || code;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('balance')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'balance' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Balance Sheet
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'activity' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Activity Report
        </button>
        <button 
          onClick={() => setActiveTab('receivables')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'receivables' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Receivables Aging
        </button>
        <button 
          onClick={() => setActiveTab('entry')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap flex items-center gap-2 ${activeTab === 'entry' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          General Journal (Input)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        
        {/* Balance Sheet View */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Statement of Financial Position (Comparative)</h3>
              <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Audited Standard</span>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_BALANCE_SHEET} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                  <YAxis tickFormatter={(val) => `Rp${val/1000000000}B`} />
                  <Tooltip formatter={(val: number) => formatIDR(val)} />
                  <Legend />
                  <Bar dataKey="amountPrevious" name="Previous Year" fill="#94a3b8" />
                  <Bar dataKey="amountCurrent" name="Current Year" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Year</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {MOCK_BALANCE_SHEET.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{formatIDR(item.amountCurrent)}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{formatIDR(item.amountPrevious)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Report View */}
        {activeTab === 'activity' && (
          <div>
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Laporan Aktivitas (Single Step)</h3>
              <div className="text-right">
                <p className="text-sm text-gray-500">Surplus/Deficit</p>
                <p className={`text-xl font-bold ${activitySummary.surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatIDR(activitySummary.surplus)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4">
                <h4 className="font-bold text-lg text-gray-700 mb-2 border-b pb-2">Revenues (Pendapatan)</h4>
                {MOCK_ACTIVITY.filter(i => i.category === 'Revenue').map(item => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>{item.name}</span>
                    <span className="font-mono">{formatIDR(item.amountCurrent)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t mt-2 bg-gray-50 font-bold">
                  <span>Total Revenue</span>
                  <span>{formatIDR(activitySummary.revenue)}</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded p-4">
                <h4 className="font-bold text-lg text-gray-700 mb-2 border-b pb-2">Expenses (Beban)</h4>
                {MOCK_ACTIVITY.filter(i => i.category === 'Expense').map(item => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>{item.name}</span>
                    <span className="font-mono text-red-600">({formatIDR(item.amountCurrent)})</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t mt-2 bg-gray-50 font-bold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">({formatIDR(activitySummary.expense)})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receivables View */}
        {activeTab === 'receivables' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Provision for Doubtful Accounts (Penyisihan Piutang)</h3>
              <p className="text-sm text-gray-500">Logic: 6-12 months (50%), &gt;12 months (100%)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">Gross Receivables</p>
                <p className="text-2xl font-bold text-blue-900">{formatIDR(receivablesAnalysis.totalReceivable)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Provision Allowance</p>
                <p className="text-2xl font-bold text-red-900">{formatIDR(receivablesAnalysis.totalProvision)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Net Receivables (NRV)</p>
                <p className="text-2xl font-bold text-green-900">{formatIDR(receivablesAnalysis.netReceivable)}</p>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aging (Months)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Provision %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Provision Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {receivablesAnalysis.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium">{item.payerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${item.ageMonths > 12 ? 'bg-red-100 text-red-800' : item.ageMonths > 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {item.ageMonths} mo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{formatIDR(item.amount)}</td>
                    <td className="px-6 py-4 text-right">{(item.provisionRate * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 text-right text-red-600">{formatIDR(item.provisionAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* General Journal Entry View */}
        {activeTab === 'entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 border border-gray-200 rounded p-4 bg-gray-50">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Record Transaction
              </h3>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border rounded p-2 text-sm"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({...entryForm, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pembelian Obat, Terima BPJS"
                    className="w-full border rounded p-2 text-sm"
                    value={entryForm.description}
                    onChange={(e) => setEntryForm({...entryForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ref ID</label>
                  <input 
                    type="text" 
                    placeholder="Invoice # or Doc Ref"
                    className="w-full border rounded p-2 text-sm"
                    value={entryForm.reference}
                    onChange={(e) => setEntryForm({...entryForm, reference: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-teal-700 mb-1">Debit Account</label>
                    <select 
                      required
                      className="w-full border rounded p-2 text-sm bg-white"
                      value={entryForm.debitAccount}
                      onChange={(e) => setEntryForm({...entryForm, debitAccount: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {ACCOUNT_CHART.map(acc => (
                        <option key={`dr-${acc.code}`} value={acc.code}>{acc.code} - {acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">Credit Account</label>
                    <select 
                      required
                      className="w-full border rounded p-2 text-sm bg-white"
                      value={entryForm.creditAccount}
                      onChange={(e) => setEntryForm({...entryForm, creditAccount: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {ACCOUNT_CHART.map(acc => (
                        <option key={`cr-${acc.code}`} value={acc.code}>{acc.code} - {acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (IDR)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full border rounded p-2 text-sm font-mono"
                    value={entryForm.amount}
                    onChange={(e) => setEntryForm({...entryForm, amount: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-2 rounded hover:bg-teal-800 transition-colors text-sm font-medium"
                >
                  Post Entry
                </button>
              </form>
            </div>

            {/* Transaction List */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-gray-700 mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description / Ref</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {transactions.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-2 align-top text-gray-500 text-xs">{entry.date}</td>
                        <td className="px-4 py-2 align-top">
                          <div className="font-medium text-gray-900">{entry.description}</div>
                          <div className="text-xs text-gray-400">Ref: {entry.reference}</div>
                        </td>
                        <td className="px-4 py-2 align-top text-teal-700 text-xs">
                          {getAccountName(entry.debitAccount)}
                        </td>
                        <td className="px-4 py-2 align-top text-red-700 text-right text-xs">
                          {getAccountName(entry.creditAccount)}
                        </td>
                        <td className="px-4 py-2 align-top text-right font-mono font-medium">
                          {formatIDR(entry.amount)}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FinancialDashboard;