import * as React from 'react';
import {Route, Switch} from 'react-router-dom';

import Root from './Root';
import {MainPage} from './pages/MainPage';
import NotFound from './pages/NotFound'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import {AuditPage} from './components/admin/audit/AuditPage'
import {SettingsPage} from './components/admin/settings/SettingsPage'
import {MailLogPage} from './components/admin/maillog/MailLogPage'
import {KravListPage} from './pages/KravListPage'
import {KravPage} from './pages/KravPage'

const Routes = (): JSX.Element => (
  <Root>
    <Switch>
      <Route exact path="/" component={MainPage}/>

      <Route exact path="/krav" component={KravListPage}/>
      <Route exact path="/krav/:id" component={KravPage}/>
      <Route exact path="/krav/:kravNummer/:kravVersjon" component={KravPage}/>

      <Route exact path="/admin/codelist/:listname?" component={CodeListPage}/>
      <Route exact path="/admin/audit/:id?/:auditId?" component={AuditPage}/>
      <Route exact path="/admin/settings" component={SettingsPage}/>
      <Route exact path="/admin/maillog" component={MailLogPage}/>

      <Route component={NotFound}/>
    </Switch>
  </Root>
)

export default Routes
