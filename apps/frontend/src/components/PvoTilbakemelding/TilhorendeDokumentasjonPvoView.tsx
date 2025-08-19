import { FunctionComponent, RefObject } from 'react'
import {
  IPageResponse,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../constants'
import { TilhorendeDokumentasjonContent } from '../PvkDokument/readOnly/TilhorendeDokumentasjonContent'
import { ContentLayout } from '../layout/layout'
import PvoFormButtons from './edit/PvoFormButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const TilhorendeDokumentasjonPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvkKrav,
  isPvkKravLoading,
}) => {
  return (
    <div className='w-full'>
      <ContentLayout>
        <TilhorendeDokumentasjonContent
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkKrav={pvkKrav}
          isPvkKravLoading={isPvkKravLoading}
        />
      </ContentLayout>
      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}
export default TilhorendeDokumentasjonPvoView
