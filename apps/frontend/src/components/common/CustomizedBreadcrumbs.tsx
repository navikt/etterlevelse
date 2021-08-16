import React from "react";
import { Breadcrumbs, BreadcrumbsOverrides, BreadcrumbsProps } from "baseui/breadcrumbs";
import _ from "lodash";
import RouteLink from "./RouteLink";

export interface breadcrumbPaths {
  href: string,
  pathName: string,
}

interface Props {
  paths?: breadcrumbPaths[],
  currentPage?: string,
  fontColor?: string
}

type CustomizedProps = Props & BreadcrumbsProps

const CustomizedBreadcrumbs = (props: CustomizedProps) => {

  const customOverrides: BreadcrumbsOverrides = {
    Separator: {
      style: {
        color: props.fontColor ? props.fontColor: undefined
      }
    },
    Root: {
      style: {
        color: props.fontColor ? props.fontColor: undefined
      }
    }
  }

  const overrides = _.merge(customOverrides, props.overrides)

  const getName = (pathName: string) => pathName.length > 25 ? pathName.substring(0, 25) + '...' : pathName

  const getBreadcrumbs = () => {
    if (props.paths && props.paths.length) {
      return props.paths.map((path) => {
        return (
          <RouteLink fontColor={props.fontColor} href={path.href}>{getName(path.pathName)}</RouteLink>
        )
      })
    }
  }

  return (
    <Breadcrumbs overrides={overrides}>
      <RouteLink fontColor={props.fontColor} href="/">Forsiden</RouteLink>
      {getBreadcrumbs()}
      {props.currentPage && <span>{getName(props.currentPage)}</span>}
    </Breadcrumbs>
  )
}

export default CustomizedBreadcrumbs
