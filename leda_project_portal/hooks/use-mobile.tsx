/**
 * Hook that detects whether the current viewport is a mobile-sized screen.
 * Uses a MediaQueryList listener to reactively update when the window is resized.
 */
import * as React from "react"

// Breakpoint (px) below which the layout is considered mobile
const MOBILE_BREAKPOINT = 768

/**
 * Returns `true` when the viewport width is below the mobile breakpoint.
 * Initialises as `undefined` on the server; resolves on first client render.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Listen for viewport changes and sync state
    mql.addEventListener("change", onChange)
    // Set initial value immediately
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Coerce undefined (SSR) to false
  return !!isMobile
}
