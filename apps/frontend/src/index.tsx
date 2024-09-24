import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import { Root, createRoot } from 'react-dom/client'
import Main from './main'
import './main.css'
import { fetchCodelistService } from './services/Codelist'
import { fetchUserService } from './services/User'

const container: HTMLElement | null = document.getElementById('root')
if (container) {
  fetchCodelistService()
  fetchUserService()

  const root: Root = createRoot(container)

  root.render(<Main />)
}
