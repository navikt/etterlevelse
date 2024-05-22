import { BodyShort, Button } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { useState } from 'react'
import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '../../api/EtterlevelseDokumentasjonApi'
import { IKravPriorityList, TEtterlevelseDokumentasjonQL, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { AccordionList } from '../focusList/AccordionList'

interface IProps {
  loading: boolean
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  allKravPriority: IKravPriorityList[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
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
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  const submit = async (value: TEtterlevelseDokumentasjonQL) => {
    const updatedEtterlevelseDokumentajson = await getEtterlevelseDokumentasjon(value.id)

    const etterlevelseDokumentasjonWithFocusList: TEtterlevelseDokumentasjonQL = {
      ...updatedEtterlevelseDokumentajson,
      prioritertKravNummer: value.prioritertKravNummer,
    }
    setEtterlevelseDokumentasjon(etterlevelseDokumentasjonWithFocusList)
    await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjonWithFocusList).catch((e) =>
      console.debug(e)
    )
  }

  console.debug(loading)

  return (
    <div>
      {!isEditMode && (
        <div>
          <Button className="mb-4" type="button" onClick={() => setIsEditMode(true)}>
            Velg krav
          </Button>

          {etterlevelseDokumentasjon.prioritertKravNummer.length === 0 && (
            <BodyShort>Ingen prioriterte krav i listen</BodyShort>
          )}

          {etterlevelseDokumentasjon.prioritertKravNummer.length !== 0 && <div>testing</div>}
        </div>
      )}
      {isEditMode && (
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            submit(values)
            setIsEditMode(false)
          }}
          initialValues={etterlevelseDokumentasjonMapToFormVal(etterlevelseDokumentasjon)}
        >
          {({ submitForm }) => (
            <Form>
              <div className="mt-4">
                <FieldArray name="prioritertKravNummer">
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
              <div className="border-border-subtle flex -mt-1 items-center gap-2 sticky bottom-0 border-black border-t-2 bg-bg-default z-10 py-4">
                <Button type="button" onClick={submitForm}>
                  Lagre
                </Button>

                <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
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
