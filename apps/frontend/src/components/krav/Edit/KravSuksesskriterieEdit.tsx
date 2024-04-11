import { PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import { Box, Button, Radio, RadioGroup, TextField, Tooltip } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import * as _ from 'lodash'
import { useEffect, useState } from 'react'
import { EKravStatus, ISuksesskriterie } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks/customHooks'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { RearrangeButtons } from '../../common/RearrangeButtons'
import TextEditor from '../../common/TextEditor/TextEditor'

type TKravSuksesskriterieEditProps = {
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
  newKrav?: boolean
}

export const KravSuksesskriterierEdit = ({
  setIsFormDirty,
  newVersion,
  newKrav,
}: TKravSuksesskriterieEditProps) => (
  <FieldWrapper>
    <FieldArray name={'suksesskriterier'}>
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
    <div className="my-4 ml-2.5 self-end">
      <Button
        type="button"
        icon={<PlusIcon aria-label="" aria-hidden />}
        variant="secondary"
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
    <div className="flex flex-col">
      {suksesskriterier.map((suksesskriterium, index) => (
        <Kriterie
          key={suksesskriterium.id}
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
        (fieldArrayRenderProps.form.values.status !== EKravStatus.AKTIV || newVersion) && (
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
  const [navn, setNavn, navnInput] = useDebouncedState(suksesskriterium.navn, debounceDelay)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(
    suksesskriterium.beskrivelse || '',
    debounceDelay
  )
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(
    suksesskriterium.behovForBegrunnelse === undefined
      ? 'true'
      : suksesskriterium.behovForBegrunnelse.toString()
  )

  const nummer = index + 1

  const updateIndex = (newIndex: number) => {
    const suksesskriterieToMove = fieldArrayRenderProps.form.values.suksesskriterier[index]
    fieldArrayRenderProps.remove(index)
    fieldArrayRenderProps.insert(newIndex, suksesskriterieToMove)
  }

  useEffect(() => {
    update({
      id: suksesskriterium.id,
      navn,
      beskrivelse,
      behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false,
    })
  }, [navn, beskrivelse, behovForBegrunnelse])

  return (
    <Box padding="4" className="mb-4" background="surface-subtle" borderColor="border-on-inverted">
      <div className="relative pt-1">
        <div className="flex items-center absolute right-0 top-0">
          {(fieldArrayRenderProps.form.values.status !== EKravStatus.AKTIV || newVersion) && (
            <Tooltip content="Fjern suksesskriterium">
              <Button
                variant="secondary"
                type={'button'}
                icon={
                  <TrashIcon title="Fjern suksesskriterium" arial-label="Fjern suksesskriterium" />
                }
                onClick={remove}
              />
            </Tooltip>
          )}

          <RearrangeButtons
            label="suksesskriterium"
            index={index}
            arrayLength={arrayLength}
            updateIndex={updateIndex}
            marginLeft
          />
        </div>

        <div>
          <LabelWithTooltip
            label={`Suksesskriterium ${nummer}`}
            tooltip="Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers."
          />
          <TextField
            label={`Suksesskriterium ${nummer}`}
            hideLabel
            value={navnInput}
            onChange={(e) => setNavn((e.target as HTMLInputElement).value)}
            placeholder="Navn"
            error={
              fieldArrayRenderProps.form.errors &&
              fieldArrayRenderProps.form.errors['suksesskriterier'] && (
                <FormError fieldName="suksesskriterier" />
              )
            }
          />
        </div>

        <div>
          <LabelWithTooltip
            label="Beskrivelse av suksesskriteriet"
            tooltip="Nærmere detaljer rundt oppnåelse av suksesskriteriet."
          />
          <TextEditor
            initialValue={beskrivelse}
            setValue={setBeskrivelse}
            height="15.625rem"
            setIsFormDirty={setIsFormDirty}
          />
        </div>

        <div className="flex flex-1 mt-1">
          <RadioGroup
            legend="Velg type besvarelse:"
            value={behovForBegrunnelse}
            onChange={(value) => {
              fieldArrayRenderProps.form.setFieldValue(
                'behovForBegrunnelse',
                value === 'true' ? true : false
              )
              setBehovForBegrunnelse(value)
            }}
          >
            <Radio value="true">Bekreftelse med tekstlig begrunnelse</Radio>
            <Radio value="false">Kun bekreftelse </Radio>
          </RadioGroup>
        </div>
      </div>
    </Box>
  )
}
