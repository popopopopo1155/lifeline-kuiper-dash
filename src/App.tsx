import React from 'react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { AdminProvider } from './contexts/AdminContext';

function App() {
  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </AdminProvider>
  );
}

export default App;
