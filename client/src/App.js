import React from 'react';
import './App.css';
import { AllRoutes } from './routes/AllRoutes';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('UI error:', error); }
  render() {
    if (this.state.hasError) {
      return <div className="app-error"><div className="app-error-card"><h1>Something went wrong</h1><p>The page encountered an unexpected problem. Refresh the page and try again.</p><button onClick={() => window.location.reload()}>Refresh page</button></div></div>;
    }
    return this.props.children;
  }
}

function App() {
  return <ErrorBoundary><AllRoutes /></ErrorBoundary>;
}

export default App;
