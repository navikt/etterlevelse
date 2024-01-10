import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import Main from './main'
import './main.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Main />)
}
