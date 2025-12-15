import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import FinancialDashboard from './pages/FinancialDashboard';
import ClinicalAssistant from './pages/ClinicalAssistant';

const App: React.FC = () => {
  // Mock role state to demonstrate Access Control
  const [userRole, setUserRole] = useState<'admin' | 'accountant' | 'doctor'>('admin');

  return (
    <HashRouter>
      <Layout userRole={userRole} setUserRole={setUserRole}>
        <Routes>
          <Route path="/" element={<Navigate to="/financial" replace />} />
          
          <Route 
            path="/financial" 
            element={
              userRole === 'doctor' ? 
              <div className="p-8 text-center text-gray-500">Access Denied: Financial Data Restricted</div> : 
              <FinancialDashboard />
            } 
          />
          
          <Route 
            path="/clinical" 
            element={
              userRole === 'accountant' ? 
              <div className="p-8 text-center text-gray-500">Access Denied: Clinical Data Restricted</div> : 
              <ClinicalAssistant />
            } 
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;