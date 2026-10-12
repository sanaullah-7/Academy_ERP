import AppRouter from './routes/AppRouter.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import { Card } from './components/ui/card.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BranchProvider } from './contexts/BranchContext.jsx'
import { AcademyProvider } from './contexts/AcademyContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

function App() {

  return (
    <AcademyProvider><ThemeProvider><AuthProvider><BranchProvider><AppRouter>
      <DashboardLayout>
        <Card className="workspace-home">Academy Managemnt System</Card>
      </DashboardLayout>
    </AppRouter></BranchProvider></AuthProvider></ThemeProvider></AcademyProvider>
  )
}

export default App
