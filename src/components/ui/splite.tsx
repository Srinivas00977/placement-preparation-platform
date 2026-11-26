'use client'

import React, { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

class SplineErrorBoundary extends Component<{ children: ReactNode; className?: string }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; className?: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Spline 3D rendering error caught gracefully:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded-2xl bg-neutral-950/60 border border-neutral-800/40 p-8 ${this.props.className || ''}`}>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-neutral-800 via-neutral-700 to-white/20 animate-pulse opacity-40 blur-xl"></div>
            <div className="w-24 h-24 rounded-full border border-neutral-700/80 bg-neutral-900/80 flex items-center justify-center shadow-2xl">
              <div className="w-12 h-12 rounded-full border border-white/20 bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-neutral-400 text-center tracking-wide">
            AI Preparation Visual Engine
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineErrorBoundary className={className}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-neutral-950/20 rounded-2xl">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-600 border-t-white animate-spin" />
              <div className="animate-pulse text-xs text-neutral-400 font-medium tracking-wide">
                Loading 3D Visual Engine...
              </div>
            </div>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
        />
      </Suspense>
    </SplineErrorBoundary>
  )
}
