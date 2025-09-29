import { FunctionComponent, ReactNode, Suspense } from 'react'
import { Footer } from './components/others/layout/footer/footer'
import Header from './components/others/layout/header/header'
import './globals.css'
import DataProvider from './provider/DataProvider'
import { UserProvider } from './provider/user/userProvider'

type TProps = {
  children: ReactNode
}

const Main: FunctionComponent<TProps> = async ({ children }) => {
  return (
    <html lang='no'>
      <body>
        <UserProvider>
          <DataProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <div className='flex flex-col w-full items-center min-h-screen bg-white'>
                <Header />
                {children}
                <Footer />
              </div>
            </Suspense>
          </DataProvider>
        </UserProvider>
      </body>
    </html>
  )
}

export default Main
