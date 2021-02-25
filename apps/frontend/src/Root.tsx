import * as React from "react";
import {Helmet} from "react-helmet";
import {Block} from 'baseui/block'

interface RootProps {
  children: JSX.Element | Array<JSX.Element>;
}

const Root = ({children}: RootProps): JSX.Element => {

  return (
    <Block width='100%'>
      <Helmet>
        <meta charSet="utf-8"/>
        <title>Etterlevelse</title>
      </Helmet>
      {children}
    </Block>
  );
}

export default Root;
