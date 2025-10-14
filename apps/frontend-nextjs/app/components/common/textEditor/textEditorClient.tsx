import dynamic from 'next/dynamic'

// Dynamically import TextEditor with SSR disabled
const TextEditor = dynamic(() => import('./TextEditor'), { ssr: false })

export default TextEditor
