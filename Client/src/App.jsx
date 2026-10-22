import { useEffect } from 'react'
import AppRouter from './routes/AppRouter.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BranchProvider } from './contexts/BranchContext.jsx'
import { AcademyProvider } from './contexts/AcademyContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

function App() {
  useEffect(() => {
    const handleBeforePrint = () => {
      if (document.querySelector('[role="dialog"], .ui-dialog-content')) {
        document.body.classList.add('is-printing-modal')
      }
    }
    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing-modal')
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return (
    <AuthProvider><BranchProvider><AcademyProvider><ThemeProvider><AppRouter /></ThemeProvider></AcademyProvider></BranchProvider></AuthProvider>
  )
}

export default App
