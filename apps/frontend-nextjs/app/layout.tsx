'use client'

import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

type TProps = {
  children: ReactNode
}

const Main: FunctionComponent<TProps> = ({ children }) => (
  <html>
    <body>
      <HelmetProvider>
        <Helmet>
          <meta charSet='utf-8' />
          <title>Etterlevelse</title>
        </Helmet>

        <div className='flex flex-col w-full items-center min-h-screen bg-white'>
          <header>HEADER</header>
          {children}
          <footer>FOOTER</footer>
        </div>
      </HelmetProvider>
    </body>
  </html>
)

export default Main
