import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import { Root, createRoot } from 'react-dom/client'
import Main from './main'
import './main.css'
import { codelist } from './services/Codelist'
import { user } from './services/User'

const container: HTMLElement | null = document.getElementById('root')
if (container) {
  console.log('codelist', codelist)

  console.log('user', user)

  /* Sannsynlig at vi må legge void call på codelist og user her for å starte API call */
  const root: Root = createRoot(container)
  console.log('container')

  root.render(<Main />)
}
