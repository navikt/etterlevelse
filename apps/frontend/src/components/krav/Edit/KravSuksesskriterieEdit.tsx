import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { Suksesskriterie } from '../../../constants'
import { FormControl } from 'baseui/form-control'
import { Block } from 'baseui/block'
import Button, { buttonBorderStyle } from '../../common/Button'
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
import { Label3 } from 'baseui/typography'

export const KravSuksesskriterierEdit = () => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterier'}>{(p) => <KriterieList p={p} />}</FieldArray>
    </FieldWrapper>
  )
}

const nextId = (suksesskriterier: Suksesskriterie[]) => {
  const max = _.max(suksesskriterier.map((s) => s.id)) || 0
  return max + 1
}

const KriterieList = ({ p }: { p: FieldArrayRenderProps }) => {
  const suksesskriterier = p.form.values.suksesskriterier as Suksesskriterie[]

  if (!suksesskriterier.length) {
    p.push({ id: nextId(suksesskriterier), navn: '', beskrivelse: '' })
  }

  return (
    <Block display={'flex'} flexDirection={'column'}>
      <DragDropContext
        onDragEnd={(result, provided) => {
          if (!result.destination) {
            return
          }
          const moved = p.remove(result.source.index)
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
                            console.log('remove' + i)
                            p.remove(i)
                          }}
                          dragHandleProps={dprov.dragHandleProps}
                          isDragging={dsnap.isDragging}
                          p={p}
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
      <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale600} marginBottom={theme.sizing.scale600}>
        <Button
          type="button"
          icon={faPlus}
          marginLeft
          label={'Suksesskriterie'}
          $style={buttonBorderStyle}
          kind="secondary"
          size="compact"
          disabled={suksesskriterier.length >= 15}
          onClick={() => p.push({ id: nextId(suksesskriterier), navn: '', beskrivelse: '', behovForBegrunnelse: 'true' })}
        >
          Suksesskriterie
        </Button>
      </Block>
    </Block>
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
}: {
  s: Suksesskriterie
  nummer: number
  update: (s: Suksesskriterie) => void
  remove: () => void
  dragHandleProps?: DraggableProvidedDragHandleProps
  isDragging: boolean
  p: FieldArrayRenderProps
}) => {
  const debounceDelay = 500
  const [navn, setNavn, navnInput] = useDebouncedState(s.navn, debounceDelay)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(s.beskrivelse || '', debounceDelay)
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(s.behovForBegrunnelse === undefined ? 'true' : s.behovForBegrunnelse.toString())

  useEffect(() => {
    update({ id: s.id, navn, beskrivelse, behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false })
  }, [navn, beskrivelse, behovForBegrunnelse])

  return (
    <Card
      overrides={{
        Root: {
          style: {
            backgroundColor: isDragging ? '#F6E8E6' : ettlevColors.grey25,
            marginBottom: theme.sizing.scale600,
          },
        },
      }}
    >
      <Block position={'relative'} paddingTop={theme.sizing.scale100}>
        <Block display={'flex'} alignItems={'flex-start'} position={'absolute'} right={0} top={0}>
          <Button type={'button'} size={'compact'} kind={'tertiary'} $style={buttonBorderStyle} icon={faTrash} onClick={remove} tooltip={'Fjern suksesskriterie'} />
          <Block width={theme.sizing.scale1000} />
          <Block {...dragHandleProps}>
            <FontAwesomeIcon icon={faGripVertical} aria-label={'Dra og slipp håndtak'} />
          </Block>
        </Block>

        <FormControl
          label={
            <Block display={'flex'} width={'100%'} justifyContent={'space-between'}>
              <LabelWithTooltip
                label={`Suksesskriterie ${nummer}`}
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
          <TextEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'} />
        </FormControl>
        <Block display="flex" flex="1" justifyContent="center">
          <Label3 marginBottom="6px" marginTop="6px" marginRight="14px" $style={{ maxWidth: '162px', width: '100%', fontWeight: 600, lineHeight: '22px' }}>
            Velg type besvarelse:
          </Label3>

          <FormControl overrides={{ ControlContainer: { style: { marginBottom: '0px' } } }}>
            <RadioGroup
              value={behovForBegrunnelse}
              onChange={(e) => {
                p.form.setFieldValue('behovForBegrunnelse', e.target.value === 'true' ? true : false)
                setBehovForBegrunnelse(e.target.value)
              }}
              name="behovForBegrunnelse"
              align={ALIGN.horizontal}
              overrides={{Root: {
                style: {
                  marginRight: '34px'
                }
              }}}
            >
              <Radio value="true">Bekreftelse med tekstlig begrunnelse</Radio>
              <Radio value="false">Kun bekreftelse </Radio>
            </RadioGroup>
          </FormControl>
        </Block>
      </Block>
    </Card>
  )
}
