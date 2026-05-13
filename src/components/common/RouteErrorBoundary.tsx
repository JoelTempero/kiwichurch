import { Component, type ReactNode } from 'react'
import { Button } from './Button'

interface State { error: Error | null; componentStack: string | null }

// Last-line-of-defence around the lazy-loaded route tree. Catches errors
// that slip past lazyWithRetry (e.g. a render throw inside a page) and
// gives the user a Refresh button instead of a white screen.
export class RouteErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, componentStack: null }

  static getDerivedStateFromError(error: Error) {
    return { error, componentStack: null }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[RouteErrorBoundary] caught', error, info.componentStack)
    this.setState({ componentStack: info.componentStack || null })
  }

  render() {
    if (!this.state.error) return this.props.children
    const err = this.state.error
    return (
      <div className="min-h-screen flex items-start justify-center p-6 bg-cream">
        <div className="max-w-2xl w-full bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-8">
          <h1 className="font-display text-2xl text-forest mb-2">Something went wrong loading this page</h1>
          <p className="text-text-primary mb-4">
            It looks like the app updated while you had it open. Refreshing should fix it.
          </p>
          <div className="flex gap-3 mb-6">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = '/home' }}>
              Go home
            </Button>
          </div>
          <details className="text-left text-xs bg-white border border-[#e0dbd2] rounded-md p-3 font-mono overflow-x-auto">
            <summary className="cursor-pointer text-text-light font-sans not-italic select-none">
              Technical details (for Joel)
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <div className="text-text-light font-sans not-italic mb-1">Error:</div>
                <div className="text-red-700 whitespace-pre-wrap break-all">{err.name}: {err.message}</div>
              </div>
              {err.stack && (
                <div>
                  <div className="text-text-light font-sans not-italic mb-1">Stack:</div>
                  <pre className="text-text-primary whitespace-pre-wrap break-all m-0">{err.stack}</pre>
                </div>
              )}
              {this.state.componentStack && (
                <div>
                  <div className="text-text-light font-sans not-italic mb-1">Component stack:</div>
                  <pre className="text-text-primary whitespace-pre-wrap break-all m-0">{this.state.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
          <p className="text-xs text-text-lighter mt-4 m-0">
            If this keeps happening, sign out and back in.
          </p>
        </div>
      </div>
    )
  }
}
