import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { KravStatus, Suksesskriterie } from '../../../constants'
import { FormControl } from 'baseui/form-control'
import { Block } from 'baseui/block'
import { buttonBorderStyle, Button as OldButton } from '../../common/Button'
import * as _ from 'lodash'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { faGripVertical, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Card } from 'baseui/card'
import { theme } from '../../../util'
import { useDebouncedState } from '../../../util/hooks'
import { DragDropContext, Draggable, DraggableProvidedDragHandleProps, DraggingStyle, Droppable } from 'react-beautiful-dnd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { kravModal } from '../EditKrav'
import CustomizedInput from '../../common/CustomizedInput'
import { ettlevColors } from '../../../util/theme'
import { Error } from '../../common/ModalSchema'
import { borderColor } from '../../common/Style'
import { ALIGN, Radio, RadioGroup } from 'baseui/radio'
import { LabelSmall } from 'baseui/typography'
import { Box, Button, Tooltip } from '@navikt/ds-react'
import { DragVerticalIcon, PlusIcon, TrashIcon } from '@navikt/aksel-icons'

type KravSuksesskriterieEditProps = {
  setIsFormDirty?: (v: boolean) => void
  newVersion: boolean
}

export const KravSuksesskriterierEdit = ({ setIsFormDirty, newVersion }: KravSuksesskriterieEditProps) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterier'}>{(p) => <KriterieList p={p} setIsFormDirty={setIsFormDirty} newVersion={newVersion} />}</FieldArray>
    </FieldWrapper>
  )
}

const nextId = (suksesskriterier: Suksesskriterie[]) => {
  const max = _.max(suksesskriterier.map((s) => s.id)) || 0
  return max + 1
}

const KriterieList = ({ p, setIsFormDirty, newVersion }: { p: FieldArrayRenderProps; setIsFormDirty?: (v: boolean) => void; newVersion: boolean }) => {
  const suksesskriterier = p.form.values.suksesskriterier as Suksesskriterie[]

  if (!suksesskriterier.length) {
    p.push({ id: nextId(suksesskriterier), navn: '', beskrivelse: '' })
  }

  return (
    <div className="flex flex-col">
      <DragDropContext
        onDragEnd={(result, provided) => {
          if (!result.destination) {
            return
          }
          const moved = p.form.values.suksesskriterier[result.source.index]
          p.remove(result.source.index)
          p.insert(result.destination.index, moved)
        }}
      >
        <Droppable droppableId={'list'}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                backgroundColor: snapshot.isDraggingOver ? '#C5C5C5' : undefined,
              }}
            >
              {suksesskriterier.map((s, i) => (
                <Draggable key={s.id} draggableId={`${s.id}`} index={i}>
                  {(dprov, dsnap) => {
                    if (dsnap.isDragging) {
                      // Adjust location due to modal displacements
                      const style = dprov.draggableProps.style as DraggingStyle
                      const offset = { x: 115, y: 15 - (kravModal()?.scrollTop || 0) }
                      const x = style.left - offset.x
                      const y = style.top - offset.y
                      style.left = x
                      style.top = y
                    }
                    return (
                      <div {...dprov.draggableProps} ref={dprov.innerRef}>
                        <Kriterie
                          s={s}
                          nummer={i + 1}
                          update={(updated) => p.replace(i, updated)}
                          remove={() => {
                            p.remove(i)
                          }}
                          dragHandleProps={dprov.dragHandleProps ? dprov.dragHandleProps : undefined}
                          isDragging={dsnap.isDragging}
                          p={p}
                          setIsFormDirty={setIsFormDirty}
                          newVersion={newVersion}
                        />
                      </div>
                    )
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {(p.form.values.status !== KravStatus.AKTIV || newVersion) && (
        <div className="my-4 ml-2.5 self-end">
          <Button
            type="button"
            icon={<PlusIcon aria-label="" aria-hidden />}
            variant="secondary"
            disabled={suksesskriterier.length >= 15}
            onClick={() => p.push({ id: nextId(suksesskriterier), navn: '', beskrivelse: '', behovForBegrunnelse: 'true' })}
          >
            Suksesskriterie
          </Button>
        </div>
      )}
    </div>
  )
}

const Kriterie = ({
  s,
  nummer,
  update,
  remove,
  dragHandleProps,
  isDragging,
  p,
  setIsFormDirty,
  newVersion,
}: {
  s: Suksesskriterie
  nummer: number
  update: (s: Suksesskriterie) => void
  remove: () => void
  dragHandleProps?: DraggableProvidedDragHandleProps
  isDragging: boolean
  p: FieldArrayRenderProps
  setIsFormDirty?: (v: boolean) => void
  newVersion: boolean
}) => {
  const debounceDelay = 500
  const [navn, setNavn, navnInput] = useDebouncedState(s.navn, debounceDelay)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(s.beskrivelse || '', debounceDelay)
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(s.behovForBegrunnelse === undefined ? 'true' : s.behovForBegrunnelse.toString())

  useEffect(() => {
    update({ id: s.id, navn, beskrivelse, behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false })
  }, [navn, beskrivelse, behovForBegrunnelse])

  return (
    <Box padding="4" className="mb-4" background={isDragging ? 'surface-danger-subtle' : 'surface-subtle'} borderColor="border-on-inverted">
      <div className="relative pt-1">
        <div className="flex items-center absolute right-0 top-0">
          {(p.form.values.status !== KravStatus.AKTIV || newVersion) && (
            <Tooltip content="Fjern suksesskriterie">
              <Button variant="secondary" type={'button'} icon={<TrashIcon arial-label="Fjern suksesskriterie" />} onClick={remove} />
            </Tooltip>
          )}

          <div className="ml-10" {...dragHandleProps}>
            <DragVerticalIcon aria-label={'Dra og slipp håndtak'} />
          </div>
        </div>

        <FormControl
          label={
            <Block display={'flex'} width={'100%'} justifyContent={'space-between'}>
              <LabelWithTooltip
                label={`Suksesskriterium ${nummer}`}
                tooltip={
                  'Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers.'
                }
              />
            </Block>
          }
        >
          <Block>
            <CustomizedInput
              value={navnInput}
              onChange={(e) => setNavn((e.target as HTMLInputElement).value)}
              placeholder={'Navn'}
              overrides={{
                Root: {
                  style: {
                    ...borderColor(p.form.errors['suksesskriterier'] ? ettlevColors.red600 : ettlevColors.grey200),
                  },
                },
                Input: {
                  style: {
                    backgroundColor: p.form.errors['suksesskriterier'] && ettlevColors.error50,
                  },
                },
              }}
            />
            <Error fieldName={'suksesskriterier'} fullWidth />
          </Block>
        </FormControl>
        <FormControl label={<LabelWithTooltip label={'Beskrivelse av suksesskriteriet'} tooltip={'Nærmere detaljer rundt oppnåelse av suksesskriteriet.'} />}>
          {/* <MarkdownEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'} /> */}
          <TextEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'} setIsFormDirty={setIsFormDirty} />
        </FormControl>
        <Block display="flex" flex="1" justifyContent="center">
          <LabelSmall marginBottom="6px" marginTop="6px" marginRight="14px" $style={{ maxWidth: '162px', width: '100%', fontWeight: 600, lineHeight: '22px' }}>
            Velg type besvarelse:
          </LabelSmall>

          <FormControl overrides={{ ControlContainer: { style: { marginBottom: '0px' } } }}>
            <RadioGroup
              value={behovForBegrunnelse}
              onChange={(e) => {
                p.form.setFieldValue('behovForBegrunnelse', e.target.value === 'true' ? true : false)
                setBehovForBegrunnelse(e.target.value)
              }}
              name="behovForBegrunnelse"
              align={ALIGN.horizontal}
              overrides={{
                RadioGroupRoot: {
                  style: {
                    marginRight: '34px',
                  },
                },
              }}
            >
              <Radio value="true">Bekreftelse med tekstlig begrunnelse</Radio>
              <Radio value="false">Kun bekreftelse </Radio>
            </RadioGroup>
          </FormControl>
        </Block>
      </div>
    </Box>
  )
}
