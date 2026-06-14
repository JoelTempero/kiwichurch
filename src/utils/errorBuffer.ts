// Boot-time error ring buffer + diagnostics snapshot.
//
// Captures the last ~20 runtime errors (uncaught errors, unhandled promise
// rejections, and console.error calls) so a bug report can carry a debugging
// trail — the route the user was on, the device, the deployed build, and what
// went wrong recently. Installed once at app boot in main.tsx.

export interface CapturedError {
  at: string
  route: string
  kind: 'error' | 'unhandledrejection' | 'console.error'
  message: string
}

export interface BugReportDiagnostics {
  route: string
  url: string
  userAgent: string
  platform: string
  viewport: string
  appVersion: string
  buildTime: string
  gitSha: string
  recentErrors: CapturedError[]
}

const MAX_ERRORS = 20
const MAX_MSG = 1000
const buffer: CapturedError[] = []
let installed = false

function currentRoute(): string {
  try {
    return window.location.pathname + window.location.search
  } catch {
    return 'unknown'
  }
}

function push(kind: CapturedError['kind'], message: string) {
  try {
    buffer.push({
      at: new Date().toISOString(),
      route: currentRoute(),
      kind,
      message: (message || '').slice(0, MAX_MSG),
    })
    if (buffer.length > MAX_ERRORS) buffer.shift()
  } catch {
    // Capturing must never break the app.
  }
}

export function installErrorBuffer(): void {
  if (installed) return
  installed = true

  window.addEventListener('error', (e) => {
    push('error', e.message || String((e as ErrorEvent).error ?? 'Unknown error'))
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = (e as PromiseRejectionEvent).reason
    const msg =
      reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : safeStringify(reason)
    push('unhandledrejection', msg)
  })

  const originalConsoleError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    push(
      'console.error',
      args
        .map((a) => {
          if (a instanceof Error) return a.message
          if (typeof a === 'string') return a
          return safeStringify(a)
        })
        .join(' ')
    )
    originalConsoleError(...args)
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function getRecentErrors(): CapturedError[] {
  return buffer.slice()
}

export function getDiagnostics(): BugReportDiagnostics {
  return {
    route: currentRoute(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform || 'unknown' : 'unknown',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
    appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown',
    buildTime: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown',
    gitSha: typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown',
    recentErrors: getRecentErrors(),
  }
}
