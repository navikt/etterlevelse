'use client'

import { Box, ErrorSummary, Heading, ReadMore } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useContext, useEffect, useRef } from 'react'
import { InputField } from '@/components/common/inputs'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { VarslingsadresserEdit } from '@/components/varslingsadresse/VarslingsadresserEdit'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { EditBegreper } from '../KravBegreperEdit'
import { KravEditDokumentasjon } from '../kravEditDokumentasjon/kravEditDokumentasjon'
import { KravEditMultiOptionField } from '../kravEditMultiOptionField/kravEditMultiOptionField'
import { KravSuksesskriterierEdit } from '../kravSuksesskriterieEdit/kravSuksesskriterieEdit'
import { RegelverkEdit } from '../regelverkEdit/regelverkEdit'
import { KravEditRelasjoner } from '../relasjoner/kravEditRelasjoner'
import { KravEditTags } from '../tags/kravEditTags'

type TProps = {
  mode: 'create' | 'edit'
  kravVersjon: number
  errors: FormikErrors<TKravQL>
  isEditingUtgaattKrav?: boolean
}

const maxInputWidth = '25rem'

const flattenErrors = (errors: FormikErrors<TKravQL>): { key: string; error: string }[] =>
  Object.entries(errors).flatMap(([key, error]) => {
    if (typeof error === 'string') return error ? [{ key, error }] : []
    if (!Array.isArray(error)) return []

    return error.flatMap((item, index) => {
      if (typeof item === 'string') return item ? [{ key: `${key}[${index}]`, error: item }] : []
      if (!item || typeof item !== 'object') return []

      return Object.entries(item)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && !!entry[1])
        .map(([felt, feilmelding]) => ({
          key: `${key}[${index}].${felt}`,
          error:
            key === 'suksesskriterier'
              ? `Suksesskriterium ${index + 1}: ${feilmelding}`
              : feilmelding,
        }))
    })
  })

export const KravFormFields: FunctionComponent<TProps> = ({
  mode,
  kravVersjon,
  errors,
  isEditingUtgaattKrav,
}) => {
  const user = useContext(UserContext)
  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!_.isEmpty(errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [errors])

  return (
    <>
      <Box
        padding='space-16'
        background='brand-blue-soft'
        borderRadius='0 0 0 8'
        className='mt-5 mb-10'
      >
        <Heading size='medium' level='2' className='mb-3'>
          Om kravet
        </Heading>
        <InputField marginBottom label='Navn på krav' name='navn' />
        {isEditingUtgaattKrav && (
          <div className='mb-10'>
            <TextAreaField
              label='Beskriv hvorfor kravet er utgått'
              name='beskrivelse'
              height='15.625rem'
              markdown
            />
          </div>
        )}
        <TextAreaField
          label='Hensikten med kravet'
          name='hensikt'
          height='15.625rem'
          markdown
          caption='Forklar slik at etterlever forstår hva formålet med kravet er, og hvorfor det er viktig å etterleve det.'
        />
      </Box>

      <div className='flex w-full justify-center'>
        <div className='w-full mb-2.5'>
          <Box
            padding='space-16'
            background='sunken'
            borderRadius='0 0 0 8'
            className='mb-10'
            id='suksesskriterier'
          >
            <Heading level='2' size='medium' className='mb-3'>
              Suksesskriterier
            </Heading>

            <ReadMore header='Om oppretting av suksesskriterier' className='mb-5.5'>
              Her definerer du hvilke kriterier som skal til for at kravet i sin helhet er oppnådd.
              Formålet med hvert suksesskriterium er å identifisere en terskel for kravoppnåelse, og
              en enhetlig besvarelse på tvers i Nav.
            </ReadMore>

            <KravSuksesskriterierEdit />
          </Box>

          <Box
            padding='space-16'
            background='brand-blue-soft'
            borderRadius='0 0 0 8'
            className='mt-5 mb-10'
          >
            <Heading level='2' size='medium' className='mb-3'>
              Dokumentasjon
            </Heading>
            <KravEditDokumentasjon maxInputWidth={maxInputWidth} />

            <RegelverkEdit />

            {kravVersjon > 1 && mode === 'edit' && (
              <div className='w-full' id='versjonEndringer'>
                <TextAreaField
                  label='Endringer siden siste versjon'
                  name='versjonEndringer'
                  height='15.625rem'
                  markdown
                />
              </div>
            )}
          </Box>

          <Box
            padding='space-16'
            background='brand-blue-soft'
            borderRadius='0 0 0 8'
            className='mt-5 mb-10'
          >
            <Heading level='2' size='medium' className='mb-3'>
              Gruppering
            </Heading>
            <KravEditMultiOptionField
              marginBottom
              name='relevansFor'
              label='Velg kategori(er) kravet er relevant for'
              listName={EListName.RELEVANS}
            />

            <EditBegreper />
            <div className='my-3'>
              <KravEditRelasjoner />
            </div>

            {user.isAdmin() && (
              <div className='w-full my-3'>
                <KravEditTags />
              </div>
            )}
          </Box>

          <Box
            padding='space-16'
            background='brand-blue-soft'
            borderRadius='0 0 0 8'
            className='mt-5 mb-10'
          >
            <Heading level='2' size='medium' className='mb-3'>
              Kontakt
            </Heading>
            <div id='varslingsadresserQl'>
              <VarslingsadresserEdit fieldName='varslingsadresserQl' />
            </div>
          </Box>

          <FormError fieldName='varslingsadresserQl' akselStyling />

          <div className='w-full'>
            {!_.isEmpty(errors) && (
              <ErrorSummary
                ref={errorSummaryRef}
                heading={EEtterlevelseDokumentFormConstants.ERROR_SUMMARY_HEADING}
                className='mt-5'
              >
                {flattenErrors(errors).map(({ key, error }) => (
                  <ErrorSummary.Item href={`#${key}`} key={key}>
                    {error}
                  </ErrorSummary.Item>
                ))}
              </ErrorSummary>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
