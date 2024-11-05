import { List } from '@navikt/ds-react'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { SkeletonPanel } from '../common/LoadingSkeleton'
import { EtterlevelseDokumentasjonsPanel } from './EtterlevelseDokumentasjonsPanel'

interface IEtterlevelseDokumentasjonsPanels {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  loading?: boolean
}

export const EtterlevelseDokumentasjonsPanels = ({
  etterlevelseDokumentasjoner,
  loading,
}: IEtterlevelseDokumentasjonsPanels) => (
  <div>
    {loading && <SkeletonPanel count={5} />}

    {!loading && (
      <List className="mt-6 flex flex-col gap-2">
        {etterlevelseDokumentasjoner.map((etterlevelseDokumentasjon) => (
          <List.Item icon={<div />} key={etterlevelseDokumentasjon.id}>
            <EtterlevelseDokumentasjonsPanel
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
          </List.Item>
        ))}
      </List>
    )}
  </div>
)
