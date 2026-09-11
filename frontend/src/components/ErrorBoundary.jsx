import React from 'react';
import { Result, Button } from 'antd';

/**
 * Error Boundary — catches any React render crash
 * and shows a friendly error page instead of a white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: '#f0f2f5', minHeight: '100vh' }}>
          <Result
            status="500"
            title="Something went wrong"
            subTitle="The page encountered an error. This won't crash the entire app."
            extra={[
              <Button
                key="reload"
                type="primary"
                size="large"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>,
              <Button
                key="home"
                size="large"
                onClick={() => { window.location.href = '/'; }}
              >
                Go to Dashboard
              </Button>,
            ]}
          />
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left', maxWidth: 600, margin: '24px auto' }}>
              <summary style={{ cursor: 'pointer', color: '#999' }}>Error Details (dev only)</summary>
              <pre style={{ padding: 16, background: '#fff1f0', borderRadius: 8, overflow: 'auto', fontSize: 12 }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
