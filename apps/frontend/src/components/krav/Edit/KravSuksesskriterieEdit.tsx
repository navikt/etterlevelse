import { PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import { Box, Button, Radio, RadioGroup, TextField, Tooltip } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import * as _ from 'lodash'
import { useEffect, useState } from 'react'
import { EKravStatus, ISuksesskriterie } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
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
      {(p) => (
        <KriterieList
          p={p}
          setIsFormDirty={setIsFormDirty}
          newVersion={newVersion}
          newKrav={newKrav}
        />
      )}
    </FieldArray>
  </FieldWrapper>
)

const nextId = (suksesskriterier: ISuksesskriterie[]): number => {
  const max = _.max(suksesskriterier.map((s) => s.id)) || 0
  return max + 1
}

interface IPropsKriterieList {
  p: FieldArrayRenderProps
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
  newKrav?: boolean
}

const KriterieList = ({ p, setIsFormDirty, newVersion, newKrav }: IPropsKriterieList) => {
  const suksesskriterier = p.form.values.suksesskriterier as ISuksesskriterie[]

  const AddSuksessKriterieButton = () => (
    <div className="my-4 ml-2.5 self-end">
      <Button
        type="button"
        icon={<PlusIcon aria-label="" aria-hidden />}
        variant="secondary"
        disabled={suksesskriterier.length >= 15}
        onClick={() =>
          p.push({
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
      {suksesskriterier.map((s, i) => (
        <Kriterie
          key={s.id}
          s={s}
          index={i}
          arrayLength={suksesskriterier.length}
          update={(updated) => p.replace(i, updated)}
          remove={() => {
            p.remove(i)
          }}
          p={p}
          setIsFormDirty={setIsFormDirty}
          newVersion={newVersion}
        />
      ))}

      {newKrav && <AddSuksessKriterieButton />}

      {!newKrav && (p.form.values.status !== EKravStatus.AKTIV || newVersion) && (
        <AddSuksessKriterieButton />
      )}
    </div>
  )
}

interface IPropsKriterie {
  s: ISuksesskriterie
  index: number
  arrayLength: number
  update: (s: ISuksesskriterie) => void
  remove: () => void
  p: FieldArrayRenderProps
  setIsFormDirty?: (v: boolean) => void
  newVersion?: boolean
}

const Kriterie = ({
  s,
  index,
  arrayLength,
  update,
  remove,
  p,
  setIsFormDirty,
  newVersion,
}: IPropsKriterie) => {
  const debounceDelay = 500
  const [navn, setNavn, navnInput] = useDebouncedState(s.navn, debounceDelay)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(s.beskrivelse || '', debounceDelay)
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(
    s.behovForBegrunnelse === undefined ? 'true' : s.behovForBegrunnelse.toString()
  )
  const [plassering, setPlassering] = useState<string>((index + 1).toString())

  const nummer = index + 1

  const updateIndex = (newIndex: number) => {
    const suksesskriterieToMove = p.form.values.suksesskriterier[index]
    p.remove(index)
    p.insert(newIndex, suksesskriterieToMove)
  }

  useEffect(() => {
    setPlassering((index + 1).toString())
  }, [index])

  useEffect(() => {
    update({
      id: s.id,
      navn,
      beskrivelse,
      behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false,
    })
  }, [navn, beskrivelse, behovForBegrunnelse])

  return (
    <Box padding="4" className="mb-4" background="surface-subtle" borderColor="border-on-inverted">
      <div className="relative pt-1">
        <div className="flex items-center absolute right-0 top-0">
          {(p.form.values.status !== EKravStatus.AKTIV || newVersion) && (
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
            plassering={plassering}
            setPlassering={setPlassering}
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
              p.form.errors &&
              p.form.errors['suksesskriterier'] && <FormError fieldName="suksesskriterier" />
            }
          />
        </div>

        <div>
          <LabelWithTooltip
            label="Beskrivelse av suksesskriteriet"
            tooltip="Nærmere detaljer rundt oppnåelse av suksesskriteriet."
          />
          {/* <MarkdownEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'} /> */}
          <TextEditor
            initialValue={beskrivelse}
            setValue={setBeskrivelse}
            height="250px"
            setIsFormDirty={setIsFormDirty}
          />
        </div>

        <div className="flex flex-1 mt-1">
          <RadioGroup
            legend="Velg type besvarelse:"
            value={behovForBegrunnelse}
            onChange={(value) => {
              p.form.setFieldValue('behovForBegrunnelse', value === 'true' ? true : false)
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
