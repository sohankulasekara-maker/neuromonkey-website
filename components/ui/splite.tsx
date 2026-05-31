'use client'

import { Suspense, lazy } from 'react'
import type { Application } from '@splinetool/runtime'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  /** When true, the scene's baked background is made transparent on load. */
  transparent?: boolean
  /** Override the intensity of every light in the scene to tame baked glow/bloom. */
  lightIntensity?: number
}

export function SplineScene({ scene, className, transparent, lightIntensity }: SplineSceneProps) {
  const handleLoad = (app: Application) => {
    if (transparent) app.setBackgroundColor('transparent')
    if (typeof lightIntensity === 'number') {
      app.getAllObjects().forEach((o) => {
        if (typeof o.intensity === 'number') o.intensity = lightIntensity
      })
    }
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onLoad={handleLoad}
      />
    </Suspense>
  )
}
