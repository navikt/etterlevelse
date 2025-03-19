import { Button } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import { EPVK, IPvkDokument } from '../../../../constants'

interface IProps {
  pvkDokument: IPvkDokument
}

export const KravRisikoscenarioOvrigeRisikoscenarier = ({ pvkDokument }: IProps) => {
  const navigate = useNavigate()

  return (
    <div className="mt-5">
      <Button
        variant="tertiary"
        type="button"
        onClick={() => {
          navigate(
            `${EPVK.pvkDokumentasjon}/${pvkDokument.etterlevelseDokumentId}${EPVK.pvkDokument}/${pvkDokument.id}/4`
          )
        }}
      >
        Gå til liste over øvrige risikoscenarier
      </Button>
    </div>
  )
}
