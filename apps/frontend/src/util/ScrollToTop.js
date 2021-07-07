import * as React from 'react'
import { withRouter } from 'react-router-dom'

const ScrollToTop = ({ history, children }) => {
  React.useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0)
    })
    return () => {
      unlisten()
    }
  }, [])

  return <React.Fragment>{children}</React.Fragment>
}

export default withRouter(ScrollToTop)
