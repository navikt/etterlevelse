import { FunctionComponent, ReactNode, Suspense } from 'react'
import DataProvider from './api/DataProvider'
import { Footer } from './components/others/layout/footer/footer'
import Header from './components/others/layout/header/header'
import './globals.css'

type TProps = {
  children: ReactNode
}

const Main: FunctionComponent<TProps> = ({ children }) => {
  return (
    <html lang='no'>
      <body>
        <DataProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <div className='flex flex-col w-full items-center min-h-screen bg-white'>
              <Header />
              {children}
              <Footer />
            </div>
          </Suspense>
        </DataProvider>
      </body>
    </html>
  )
}

export default Main
