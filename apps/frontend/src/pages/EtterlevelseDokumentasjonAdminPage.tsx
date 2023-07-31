import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { Helmet } from 'react-helmet'
import { Layout2 } from '../components/scaffold/Page'
import { ettlevColors, maxPageWidth } from '../util/theme'
import {oppdatereTittelOgTeams} from "../api/EtterlevelseDokumentasjonApi";

export const EtterlevelseDokumentasjonAdminPage = () => {

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administrere Dokumentasjon"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administrere Dokumentasjon</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administrere Dokumentasjon</HeadingXXLarge>
        </Block>
      }
    >
      <Block display="flex" width="100%">
  <LabelLarge>Hente tittel og teams fra behandling</LabelLarge>
        <Button onClick={() => {
          oppdatereTittelOgTeams()
        }}>Oppdater</Button>
      </Block>
    </Layout2>
  )
}
export default EtterlevelseDokumentasjonAdminPage
