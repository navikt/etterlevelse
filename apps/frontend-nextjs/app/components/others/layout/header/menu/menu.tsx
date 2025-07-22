import { ampli } from '@/services/other/amplitude/amplitudeService'
import { Dropdown, InternalHeader, Link } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type TMenuItem = {
  label: ReactNode
  href?: string
  disabled?: boolean
  icon?: ReactNode
}

export const Menu = (props: { pages: TMenuItem[][]; title: ReactNode; icon?: ReactNode }) => {
  const pathname: string = usePathname()
  const { pages, title, icon } = props

  const allPages: TMenuItem[] = pages.length
    ? pages
        .filter((page) => page.length)
        .reduce((previousValue, currentValue) => [
          ...((previousValue as TMenuItem[]) || []),
          { label: <Dropdown.Menu.Divider /> },
          ...(currentValue as TMenuItem[]),
        ])
    : []

  return (
    <Dropdown>
      <InternalHeader.Button as={Dropdown.Toggle}>
        {icon} {title}
      </InternalHeader.Button>
      <Dropdown.Menu className='min-w-max h-auto'>
        <Dropdown.Menu.List>
          {allPages.map((page, index) => {
            const item =
              !!page.href && !page.disabled ? (
                <Dropdown.Menu.List.Item
                  as={Link}
                  href={page.href}
                  onClick={() => {
                    ampli().logEvent('navigere', {
                      kilde: 'header',
                      app: 'etterlevelse',
                      til: page.href,
                      fra: pathname,
                    })
                  }}
                  underline={false}
                >
                  <div className='flex items-center'>
                    {page.icon && <div className='mr-2'>{page.icon}</div>}
                    {page.label}
                  </div>
                </Dropdown.Menu.List.Item>
              ) : (
                <Dropdown.Menu.GroupedList.Heading>{page.label}</Dropdown.Menu.GroupedList.Heading>
              )
            return (
              <div key={index} className='my-1'>
                {item}
              </div>
            )
          })}
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  )
}
