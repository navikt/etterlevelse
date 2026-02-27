import { ComponentProps, FunctionComponent } from 'react'
import { CommonVariantOneGjenbruk } from '../commonGjenbruk/commonGjenbruk'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const EtterleverRolleGjenbruk: FunctionComponent<
  ComponentProps<typeof CommonVariantOneGjenbruk>
> = (props) => <CommonVariantOneGjenbruk {...props} />

export default EtterleverRolleGjenbruk
