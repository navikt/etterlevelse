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
      <div className="mt-6 flex flex-col gap-2">
        {etterlevelseDokumentasjoner.map((etterlevelseDokumentasjon) => (
          <EtterlevelseDokumentasjonsPanel
            key={etterlevelseDokumentasjon.id}
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          />
        ))}
      </div>
    )}
  </div>
)
