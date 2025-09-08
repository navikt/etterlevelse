import { BodyShort, Button } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateKravPriorityEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import {
  IKravPriorityList,
  IRisikoscenario,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { TTemaCode } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { AccordionList } from '../../focusList/AccordionList'
import KravList from './KravList'

interface IProps {
  loading: boolean
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  allKravPriority: IKravPriorityList[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
  risikoscenarioList: IRisikoscenario[]
  isRisikoscenarioLoading: boolean
}

export const FocusList = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    relevanteStats,
    temaListe,
    utgaattStats,
    allKravPriority,
    loading,
    risikoscenarioList,
    isRisikoscenarioLoading,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  const [updatedEtterlevelseDokumentasjon, setUpdatedEtterlevelseDokumentasjon] =
    useState<TEtterlevelseDokumentasjonQL>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const submit = async (value: TEtterlevelseDokumentasjonQL) => {
    await updateKravPriorityEtterlevelseDokumentasjon(value)
      .then((response) => {
        setEtterlevelseDokumentasjon(response)
      })
      .catch((e) => console.debug(e))
  }

  useEffect(() => {
    ;(async () => {
      if (isEditMode) {
        setIsLoading(true)
        await getEtterlevelseDokumentasjon(etterlevelseDokumentasjon.id).then(
          setUpdatedEtterlevelseDokumentasjon
        )
        setIsLoading(false)
      }
    })()
  }, [isEditMode])

  return (
    <div>
      {!isEditMode && (
        <div>
          {etterlevelseDokumentasjon.prioritertKravNummer.length === 0 && (
            <BodyShort>Ingen prioriterte krav i listen</BodyShort>
          )}

          {etterlevelseDokumentasjon.prioritertKravNummer.length !== 0 && (
            <KravList
              temaListe={temaListe}
              relevanteStats={relevanteStats.filter(({ kravNummer }) =>
                etterlevelseDokumentasjon.prioritertKravNummer.includes(kravNummer.toString())
              )}
              utgaattStats={utgaattStats.filter(({ kravNummer }) =>
                etterlevelseDokumentasjon.prioritertKravNummer.includes(kravNummer.toString())
              )}
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              loading={loading}
              risikoscenarioList={risikoscenarioList}
              isRisikoscenarioLoading={isRisikoscenarioLoading}
            />
          )}

          {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
            <Button
              className='mt-4'
              type='button'
              variant='secondary'
              onClick={() => setIsEditMode(true)}
            >
              Redigér prioriterte krav
            </Button>
          )}
        </div>
      )}
      {isEditMode && !isLoading && updatedEtterlevelseDokumentasjon && (
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            submit(values)
            setIsEditMode(false)
          }}
          initialValues={etterlevelseDokumentasjonMapToFormVal(updatedEtterlevelseDokumentasjon)}
        >
          {({ submitForm }) => (
            <Form>
              <div className='mt-4'>
                <FieldArray name='prioritertKravNummer'>
                  {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                    <AccordionList
                      fieldArrayRenderProps={fieldArrayRenderProps}
                      allKravPriority={allKravPriority}
                      temaListe={temaListe}
                      kravliste={relevanteStats}
                      utgattKravliste={utgaattStats}
                    />
                  )}
                </FieldArray>
              </div>
              <div className='border-border-subtle flex -mt-1 items-center gap-2 sticky bottom-0 border-black border-t-2 bg-white z-10 py-4'>
                <Button type='button' onClick={submitForm}>
                  Lagre prioriterte krav
                </Button>

                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    setEtterlevelseDokumentasjon(updatedEtterlevelseDokumentasjon)
                    setIsEditMode(false)
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default FocusList
