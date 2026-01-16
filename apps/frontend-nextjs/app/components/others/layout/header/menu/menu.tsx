'use client'

import { Dropdown, InternalHeader, Link } from '@navikt/ds-react'
import { FunctionComponent, ReactNode, useEffect, useState } from 'react'

type TMenuItem = {
  label: ReactNode
  href?: string
  disabled?: boolean
  icon?: ReactNode
}

type TMenuProps = {
  pages: TMenuItem[][]
  title: ReactNode
  icon?: ReactNode
}

export const Menu: FunctionComponent<TMenuProps> = ({ pages, title, icon }) => {
  const [allPages, setAllPages] = useState<TMenuItem[]>([])

  useEffect(() => {
    if (pages.length !== 0) {
      const formatedPages = pages
        .filter((page) => page.length)
        .reduce((previousValue, currentValue) => [
          ...((previousValue as TMenuItem[]) || []),
          { label: <Dropdown.Menu.Divider /> },
          ...(currentValue as TMenuItem[]),
        ])

      setAllPages(formatedPages)
    }
  }, [pages])

  return (
    <Dropdown>
      <InternalHeader.Button as={Dropdown.Toggle}>
        {icon} {title}
      </InternalHeader.Button>
      <Dropdown.Menu className='min-w-max h-auto'>
        <Dropdown.Menu.List>
          {allPages.map((page, index) => (
            <div key={index} className='my-1'>
              <DropdownItem page={page} />
            </div>
          ))}
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  )
}

type TDropdownItemProps = {
  page: TMenuItem
}

const DropdownItem: FunctionComponent<TDropdownItemProps> = ({ page }) => {
  const isNotGroupedList = !!page.href && !page.disabled
  return (
    <>
      {isNotGroupedList && (
        <Dropdown.Menu.List.Item
          as={Link}
          href={page.href}
          onClick={() => {
            // const ampliInstance = ampli()
            // if (ampliInstance) {
            //   ampliInstance.logEvent('navigere', {
            //     kilde: 'header',
            //     app: 'etterlevelse',
            //     til: page.href,
            //     fra: pathname,
            //   })
            // }
          }}
          underline={false}
        >
          <div className='flex items-center'>
            {page.icon && <div className='mr-2'>{page.icon}</div>}
            {page.label}
          </div>
        </Dropdown.Menu.List.Item>
      )}
      {!isNotGroupedList && (
        <Dropdown.Menu.GroupedList.Heading>{page.label}</Dropdown.Menu.GroupedList.Heading>
      )}
    </>
  )
}
