import { Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopToFormValue,
} from '../../api/BehandlingensLivslopApi'
import { IBehandlingensLivslop, IPvkDokument } from '../../constants'

interface IProps {
  pvkDokument: IPvkDokument
}

export const BehandlingensLivslopPvoView = (props: IProps) => {
  const { pvkDokument } = props
  const [behandlingensLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslop>(
    mapBehandlingensLivslopToFormValue({})
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getBehandlingensLivslopByEtterlevelseDokumentId(pvkDokument.etterlevelseDokumentId)
        .then(setBehandlingsLivslop)
        .finally(() => setIsLoading(false))
    })()
  }, [pvkDokument])

  return (
    <div className="flex justify-center">
      {isLoading && (
        <div className="flex w-full justify-center items-center mt-5">
          <Loader size="3xlarge" className="flex justify-self-center" />
        </div>
      )}
      {!isLoading && <div>{behandlingensLivslop.beskrivelse}</div>}
    </div>
  )
}
export default BehandlingensLivslopPvoView
