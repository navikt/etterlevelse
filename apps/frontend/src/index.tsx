import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react'
import Main from './main'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Main />)
}
