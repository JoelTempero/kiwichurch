import { Component, type ReactNode } from 'react'
import { Button } from './Button'

interface State { error: Error | null }

// Last-line-of-defence around the lazy-loaded route tree. Catches errors
// that slip past lazyWithRetry (e.g. a render throw inside a page) and
// gives the user a Refresh button instead of a white screen.
export class RouteErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[RouteErrorBoundary] caught', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="max-w-md w-full bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-8 text-center">
          <h1 className="font-display text-2xl text-forest mb-2">Something went wrong loading this page</h1>
          <p className="text-text-primary mb-6">
            It looks like the app updated while you had it open. Refreshing should fix it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = '/home' }}>
              Go home
            </Button>
          </div>
          <p className="text-xs text-text-lighter mt-4 m-0">
            If this keeps happening, sign out and back in.
          </p>
        </div>
      </div>
    )
  }
}
