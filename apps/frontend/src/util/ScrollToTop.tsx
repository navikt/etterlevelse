import * as React from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = ({ children }: { children: any }) => {
  const location = useLocation()

  React.useEffect(() => {
    if (!location.pathname.includes('/krav')) {
      window.scrollTo(0, 0)
    }
  }, [location])

  return children
}

export default ScrollToTop
