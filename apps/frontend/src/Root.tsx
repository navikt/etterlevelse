import * as React from "react";
import {Helmet} from "react-helmet";

interface RootProps {
  children: JSX.Element | Array<JSX.Element>;
}

const Root = ({children}: RootProps): JSX.Element => {

  return (
    <div>
      <Helmet>
        <meta charSet="utf-8"/>
        <title>Etterlevelse</title>
      </Helmet>
      {children}
    </div>
  );
}

export default Root;
