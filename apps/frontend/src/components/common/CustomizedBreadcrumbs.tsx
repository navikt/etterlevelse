import React from 'react'
import { Breadcrumbs, BreadcrumbsOverrides, BreadcrumbsProps } from 'baseui/breadcrumbs'
import _ from 'lodash'
import RouteLink from './RouteLink'
import { theme } from '../../util/theme'
import { Block } from 'baseui/block'
import { ChevronRight } from 'baseui/icon'

export interface breadcrumbPaths {
  href: string
  pathName: string
}

interface Props {
  paths?: breadcrumbPaths[]
  currentPage?: string
  fontColor?: string
}

type CustomizedProps = Props & BreadcrumbsProps

const CustomizedBreadcrumbs = (props: CustomizedProps) => {
  const customOverrides: BreadcrumbsOverrides = {
    Separator: {
      style: {
        color: props.fontColor ? props.fontColor : undefined,
        marginBottom: '4px',
      },
    },
    Root: {
      style: {
        color: props.fontColor ? props.fontColor : undefined,
      },
    },
    ListItem: {
      style: {
        ':hover': {
          textDecoration: 'underline',
        },
      },
    },
  }

  const overrides = _.merge(customOverrides, props.overrides)

  const getName = (pathName: string) => (pathName.length > 25 ? pathName.substring(0, 25) + '...' : pathName)

  const getBreadcrumbs = () => {
    if (props.paths && props.paths.length) {
      return props.paths.map((path) => {
        return (
          <RouteLink hideUnderline fontColor={props.fontColor} href={path.href} key={'breadcrumb_link_' + getName(path.pathName)}>
            {getName(path.pathName)}
          </RouteLink>
        )
      })
    }
  }

  return (
    <Block display="flex">
      <Breadcrumbs overrides={overrides}>
        <RouteLink hideUnderline fontColor={props.fontColor} href="/">
          Forsiden
        </RouteLink>
        {getBreadcrumbs()}
      </Breadcrumbs>
      {props.currentPage && (
        <Block
          $style={{
            color: props.fontColor ? props.fontColor : undefined,
            fontFamily: 'Source Sans Pro',
            fontWeight: 500,
          }}
          display={['none', 'none', 'none', 'flex', 'flex', 'flex']}
        >
          <Block marginLeft="8px" marginRight="8px" marginTop="4px" marginBottom="4px">
            <ChevronRight />
          </Block>
          <Block>{getName(props.currentPage)}</Block>
        </Block>
      )}
    </Block>
  )
}

export default CustomizedBreadcrumbs
