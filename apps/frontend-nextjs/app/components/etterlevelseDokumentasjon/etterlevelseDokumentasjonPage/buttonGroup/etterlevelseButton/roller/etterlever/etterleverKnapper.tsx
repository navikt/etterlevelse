import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

const EtterleverKnapper: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => (
  <>
    <ActionMenu.Group label=''>
      <ActionMenu.Item
        as='a'
        href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
      >
        Rediger dokumentegenskaper
      </ActionMenu.Item>
    </ActionMenu.Group>
  </>
)

export default EtterleverKnapper
