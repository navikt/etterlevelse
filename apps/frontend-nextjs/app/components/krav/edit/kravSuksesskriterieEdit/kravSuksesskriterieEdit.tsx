import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithToolTip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Markdown } from '@/components/common/markdown/markdown'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RearrangeButtons } from '@/components/common/rearrangeButtons/rearrangeButtons'
import TextEditor from '@/components/common/textEditor/TextEditorClient'
import { EKravStatus, ISuksesskriterie } from '@/constants/krav/kravConstants'
import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import { PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import { Box, Button, Radio, RadioGroup, TextField, ToggleGroup, Tooltip } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import _ from 'lodash'
import { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react'

type TKravSuksesskriterieEditProps = {
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
  newKrav?: boolean
}

export const KravSuksesskriterierEdit: FunctionComponent<TKravSuksesskriterieEditProps> = ({
  setIsFormDirty,
  newVersion,
  newKrav,
}) => (
  <FieldWrapper>
    <FieldArray name='suksesskriterier'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <KriterieList
          fieldArrayRenderProps={fieldArrayRenderProps}
          setIsFormDirty={setIsFormDirty}
          newVersion={newVersion}
          newKrav={newKrav}
        />
      )}
    </FieldArray>
  </FieldWrapper>
)

const nextId = (suksesskriterier: ISuksesskriterie[]): number => {
  const max = _.max(suksesskriterier.map((suksesskriterium) => suksesskriterium.id)) || 0
  return max + 1
}

interface IPropsKriterieList {
  fieldArrayRenderProps: FieldArrayRenderProps
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
  newKrav?: boolean
}

const KriterieList = ({
  fieldArrayRenderProps,
  setIsFormDirty,
  newVersion,
  newKrav,
}: IPropsKriterieList) => {
  const suksesskriterier = fieldArrayRenderProps.form.values.suksesskriterier as ISuksesskriterie[]

  const AddSuksessKriterieButton = () => (
    <div className='my-4 ml-2.5 self-end'>
      <Button
        type='button'
        icon={<PlusIcon aria-label='' aria-hidden />}
        variant='secondary'
        disabled={suksesskriterier.length >= 15}
        onClick={() =>
          fieldArrayRenderProps.push({
            id: nextId(suksesskriterier),
            navn: '',
            beskrivelse: '',
            behovForBegrunnelse: 'true',
          })
        }
      >
        Suksesskriterie
      </Button>
    </div>
  )

  return (
    <div className='flex flex-col'>
      {suksesskriterier.map((suksesskriterium, index) => (
        <Kriterie
          key={`${suksesskriterium.id}_${index}`}
          suksesskriterium={suksesskriterium}
          index={index}
          arrayLength={suksesskriterier.length}
          update={(updated) => fieldArrayRenderProps.replace(index, updated)}
          remove={() => {
            fieldArrayRenderProps.remove(index)
          }}
          fieldArrayRenderProps={fieldArrayRenderProps}
          setIsFormDirty={setIsFormDirty}
          newVersion={newVersion}
        />
      ))}

      {newKrav && <AddSuksessKriterieButton />}

      {!newKrav &&
        (fieldArrayRenderProps.form.initialValues.status !== EKravStatus.AKTIV || newVersion) && (
          <AddSuksessKriterieButton />
        )}
    </div>
  )
}

interface IPropsKriterie {
  suksesskriterium: ISuksesskriterie
  index: number
  arrayLength: number
  update: (suksesskriterium: ISuksesskriterie) => void
  remove: () => void
  fieldArrayRenderProps: FieldArrayRenderProps
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
}

const Kriterie = ({
  suksesskriterium,
  index,
  arrayLength,
  update,
  remove,
  fieldArrayRenderProps,
  setIsFormDirty,
  newVersion,
}: IPropsKriterie) => {
  const debounceDelay = 500
  const nummer = index + 1
  const [navn, setNavn, navnInput] = useDebouncedState(suksesskriterium.navn, debounceDelay)
  const updateIndex = (newIndex: number) => {
    fieldArrayRenderProps.move(index, newIndex)
  }
  const [beskrivelse, setBeskrivelse] = useDebouncedState(
    suksesskriterium.beskrivelse || '',
    debounceDelay
  )
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(
    suksesskriterium.behovForBegrunnelse === undefined
      ? 'true'
      : suksesskriterium.behovForBegrunnelse.toString()
  )

  const [mode, setMode] = useState('edit')

  // Track initial mount to avoid calling update on first render
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    update({
      id: suksesskriterium.id,
      navn,
      beskrivelse,
      behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false,
    })
  }, [navn, beskrivelse, behovForBegrunnelse])

  return (
    <Box padding='4' className='mb-4' background='surface-subtle' borderColor='border-on-inverted'>
      <div className='relative pt-1'>
        <div className='flex items-center absolute right-0 top-0'>
          {(fieldArrayRenderProps.form.initialValues.status !== EKravStatus.AKTIV ||
            newVersion) && (
            <Tooltip content='Fjern suksesskriterium'>
              <Button
                variant='secondary'
                type={'button'}
                icon={
                  <TrashIcon title='Fjern suksesskriterium' arial-label='Fjern suksesskriterium' />
                }
                onClick={remove}
              />
            </Tooltip>
          )}
          <RearrangeButtons
            label='suksesskriterium'
            index={index}
            arrayLength={arrayLength}
            updateIndex={updateIndex}
            marginLeft
          />
        </div>

        <div className='mb-5'>
          <LabelWithToolTip
            label={`Suksesskriterium ${nummer}`}
            tooltip='Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers.'
          />

          <TextField
            label={`Suksesskriterium ${nummer}`}
            hideLabel
            value={navnInput}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setNavn((event.target as HTMLInputElement).value)
            }
            placeholder='Navn'
            error={
              fieldArrayRenderProps.form.errors &&
              fieldArrayRenderProps.form.errors['suksesskriterier'] && (
                <FormError fieldName='suksesskriterier' />
              )
            }
          />
        </div>

        <div>
          <div className='flex w-full items-center justify-between mb-1'>
            <div>
              <LabelWithToolTip
                label='Beskrivelse av suksesskriteriet'
                tooltip='Nærmere detaljer rundt oppnåelse av suksesskriteriet.'
                noMarginBottom
              />
            </div>
          </div>

          {mode === 'edit' && (
            <TextEditor
              initialValue={beskrivelse}
              setValue={setBeskrivelse}
              height='15.625rem'
              setIsFormDirty={setIsFormDirty}
            />
          )}

          {mode === 'view' && (
            <div className='p-8 border-border-subtle-hover border border-solid rounded-md bg-white'>
              <Markdown source={beskrivelse} />
            </div>
          )}
        </div>
        <div className='flex justify-end mt-[-1px]'>
          <ToggleGroup defaultValue='edit' onChange={setMode} size='small'>
            <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
            <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
          </ToggleGroup>
        </div>

        <div className='flex flex-1 mt-1'>
          <RadioGroup
            legend='Velg type besvarelse:'
            value={behovForBegrunnelse}
            onChange={(value) => {
              fieldArrayRenderProps.form.setFieldValue(
                'behovForBegrunnelse',
                value === 'true' ? true : false
              )
              setBehovForBegrunnelse(value)
            }}
          >
            <Radio value='true'>Bekreftelse med tekstlig begrunnelse</Radio>
            <Radio value='false'>Kun bekreftelse </Radio>
          </RadioGroup>
        </div>
      </div>
    </Box>
  )
}
