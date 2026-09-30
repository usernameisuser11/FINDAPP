import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('FINDAPP render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <div className="fatal-error-card">
            <span className="brand-mark">F</span>
            <h1>화면을 불러오는 중 문제가 발생했습니다</h1>
            <p>잠시 후 다시 시도해 주세요. 계속 문제가 발생하면 새로고침해 주세요.</p>
            <button onClick={() => window.location.reload()}>새로고침</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('FINDAPP service worker registration failed:', error)
    })
  })
}
