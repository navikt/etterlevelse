'use client'

import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Footer } from './components/others/layout/footer/footer'
import Header from './components/others/layout/header/header'
import './globals.css'

type TProps = {
  children: ReactNode
}

const Main: FunctionComponent<TProps> = ({ children }) => (
  <html lang='no'>
    <body>
      <HelmetProvider>
        <Helmet>
          <meta charSet='utf-8' />
          <title>Etterlevelse</title>
        </Helmet>

        <div className='flex flex-col w-full items-center min-h-screen bg-white'>
          <Header />
          {children}
          <Footer />
        </div>
      </HelmetProvider>
    </body>
  </html>
)

export default Main
