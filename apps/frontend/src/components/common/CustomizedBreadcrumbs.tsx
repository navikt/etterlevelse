import React from "react";
import { Breadcrumbs, BreadcrumbsOverrides, BreadcrumbsProps } from "baseui/breadcrumbs";
import CustomizedLink from "./CustomizedLink";
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

  const getBreadcrumbs = () => {
    if (props.paths && props.paths.length) {
      return props.paths.map((path) => {
        return (
          <RouteLink fontColor={props.fontColor} href={path.href}>{path.pathName}</RouteLink>
        )
      })
    }
  }

  return (
    <Breadcrumbs overrides={overrides}>
      <RouteLink fontColor={props.fontColor} href="/">Forsiden</RouteLink>
      {getBreadcrumbs()}
      {props.currentPage && <span>{props.currentPage}</span>}
    </Breadcrumbs>
  )
}

export default CustomizedBreadcrumbs
