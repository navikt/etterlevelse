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
        marginBottom: '4px'
      },
    },
    Root: {
      style: {
        color: props.fontColor ? props.fontColor : undefined,
        marginBottom: theme.sizing.scale1000
      },
    },
    ListItem: {
      style: {
        ':hover': {
          textDecoration: 'underline'
        }
      }
    }
  }

  const overrides = _.merge(customOverrides, props.overrides)

  const getName = (pathName: string) => (pathName.length > 25 ? pathName.substring(0, 25) + '...' : pathName)

  const getBreadcrumbs = () => {
    if (props.paths && props.paths.length) {
      return props.paths.map((path) => {
        return (
          <RouteLink hideUnderline fontColor={props.fontColor} href={path.href}>
            {getName(path.pathName)}
          </RouteLink>
        )
      })
    }
  }

  return (
    <Block display='flex'>
      <Breadcrumbs overrides={overrides}>
        <RouteLink hideUnderline fontColor={props.fontColor} href="/">
          Forsiden
        </RouteLink>
        {getBreadcrumbs()}
      </Breadcrumbs>
      {props.currentPage &&
        <Block
          marginTop='4px'
          width='auto'
          marginBottom='4px'
          height='20px'
          $style={{
            color: props.fontColor ? props.fontColor : undefined,
            fontFamily: 'sans-serif',
            fontWeight: 500
          }}
          display={['none', 'none', 'none', 'flex', 'flex', 'flex']}
        >
          <Block marginLeft='8px' marginRight='8px'>
            <ChevronRight />
          </Block>
          {getName(props.currentPage)}
        </Block>}
    </Block>
  )
}

export default CustomizedBreadcrumbs
