import React from "react";
import {withRouter} from "react-router-dom";
import {Breadcrumbs} from "baseui/breadcrumbs";
import {StyledLink} from "baseui/link";

const CustomizedBreadcrumbs = (props:any) =>{
  const { match, location, history } = props;
  console.log(match)
  return (
    <Breadcrumbs>
      <StyledLink href="#parent">Parent Page</StyledLink>
      <StyledLink href="#sub">Sub-Parent Page</StyledLink>
      <span>Current Page</span>
    </Breadcrumbs>
  )
}

export default withRouter(CustomizedBreadcrumbs)
