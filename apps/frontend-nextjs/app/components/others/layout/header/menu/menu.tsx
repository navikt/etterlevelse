'use client'

import { Dropdown, InternalHeader, Link } from '@navikt/ds-react'
import { FunctionComponent, ReactNode, isValidElement, useEffect, useState } from 'react'

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
      <Dropdown.Menu
        className='min-w-max h-auto max-h-[80vh] overflow-y-auto'
        style={{ color: '#DFE1E5' }}
      >
        <Dropdown.Menu.List>
          {allPages.map((page, index) => (
            <DropdownItem key={index} page={page} />
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
  const isLinkItem = !!page.href && !page.disabled

  if (isLinkItem) {
    return (
      <div className='my-1'>
        <Dropdown.Menu.List.Item
          as={Link}
          href={page.href}
          style={{ color: '#DFE1E5' }}
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
      </div>
    )
  }

  if (isValidElement(page.label) && page.label.type === Dropdown.Menu.Divider) {
    return page.label
  }

  if (isValidElement(page.label)) {
    return (
      <div className='px-3 py-2' style={{ color: '#DFE1E5' }}>
        {page.label}
      </div>
    )
  }

  return (
    <Dropdown.Menu.GroupedList.Heading style={{ color: '#DFE1E5' }}>
      {page.label}
    </Dropdown.Menu.GroupedList.Heading>
  )
}
