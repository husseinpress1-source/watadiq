import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            background: '#fff',
            color: '#111',
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Something went wrong loading this page.</p>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Try a hard refresh (Ctrl+F5) or open the home page again.
            </p>
            <a href="/" style={{ color: '#e4002b', fontWeight: 600 }}>
              Go to watadiq.com
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
