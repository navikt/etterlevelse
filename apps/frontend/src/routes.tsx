import * as React from 'react';
import {Route, Switch} from 'react-router-dom';

import Root from './Root';
import {MainPage} from './pages/MainPage';
import NotFound from './pages/NotFound'

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>

      <Route component={NotFound}/>
    </Switch>
  </Root>
)

export default Routes
