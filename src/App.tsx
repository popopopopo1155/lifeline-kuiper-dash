import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';

function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <div className="min-h-screen flex flex-col">
          <Dashboard />
        </div>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
