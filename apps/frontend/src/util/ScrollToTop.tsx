import * as React from 'react'
import {Location, NavigateFunction, useLocation, useNavigate} from 'react-router-dom'
import {ReactComponentElement} from "react";

const ScrollToTop = ({children}: { children: any }) => {

  const location = useLocation()

  React.useEffect(() => {
    if (!location.pathname.includes('/krav')) {
      window.scrollTo(0, 0)
      console.log("krav")
    } else {
      console.log("ikke krav")
    }
    // })
    // return () => {
    //   unlisten()
    // }
  }, [])

  return children
}

export default ScrollToTop
