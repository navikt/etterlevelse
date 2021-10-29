import {ModalBody, ModalFooter, ModalHeader} from "baseui/modal";
import CustomizedModal from "../../common/CustomizedModal";
import {Krav} from "../../../constants";
import Button from "../../common/Button";
import React, {ReactElement, useEffect} from "react";
import {FieldArray, Form, Formik} from "formik";
import {FieldWrapper} from "../../common/Inputs";
import {arrayMove, List} from 'baseui/dnd-list';
import {CustomPanelDivider} from "../../common/CustomizedAccordion";
import {PanelLink} from "../../common/PanelLink";
import {Label3, Paragraph2} from "baseui/typography";
import moment from "moment";
import KravStatusView from "../KravStatusTag";
import {borderStyle} from "../../common/Style";

// const nextId = (kravListe: Krav[]) => {
//   const max = _.max(kravListe.map((s) => s.id)) || 0
//   return max + 1
// }

export const EditPriorityModal = (props: { isOpen: boolean; onClose: Function; kravListe: Krav[] }) => {
  const {isOpen, onClose, kravListe} = props

  const [items, setItems] = React.useState<ReactElement[]>([]);
  const [kravElements, setKravElements] = React.useState<Krav[]>(kravListe);

  useEffect(() => {
    setItems(kravListe.map((k) => {
          return (
            <CustomPanelDivider key={`${k.navn}_${k.kravNummer}`}>
              <PanelLink
                hideChevron
                useDescriptionUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                title={
                  <Paragraph2 $style={{fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px'}}>
                    K{k.kravNummer}.{k.kravVersjon}
                  </Paragraph2>
                }
                beskrivelse={<Label3 $style={{fontSize: '18px', lineHeight: '28px'}}>{k.navn}</Label3>}
                rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
                statusText={<KravStatusView status={k.status}/>}
                overrides={{
                  Block: {
                    style: {
                      ':hover': {boxShadow: 'none'},
                      ...borderStyle('hidden'),
                    },
                  },
                }}
              />
            </CustomPanelDivider>
          )
        }
      )
    )
  }, []);

  return (
    <Formik
      initialValues={{
        krav: kravElements
      }}
      onSubmit={(value) => {
        const temp = [...kravElements]
        console.log(temp)
      }
      }
    >
      {
        (p) => (
          <CustomizedModal isOpen={isOpen}>
            <ModalHeader>

            </ModalHeader>
            <ModalBody>

              <Form>
                <FieldWrapper>
                  <FieldArray name={'krav'}>{(p) => (
                    <List
                      items={items}
                      onChange={({oldIndex, newIndex}) => {
                        setItems(arrayMove(items, oldIndex, newIndex))
                        setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                      }
                      }
                    />
                  )}</FieldArray>
                </FieldWrapper>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => onClose()}>Close</Button>
              <Button
                size="compact"
                kind="secondary"
                onClick={p.submitForm}
                marginLeft>
                Lagre
              </Button>
            </ModalFooter>
          </CustomizedModal>
        )
      }
    </Formik>)
}

// const KravListe = ({p}: { p: FieldArrayRenderProps }) => {
//   const krav = p.form.values.krav as Krav[]
//
//   // if (!krav.length) {
//   //   p.push({id: nextId(krav), navn: '', beskrivelse: ''})
//   // }
//
//   return (
//     <Block display={'flex'} flexDirection={'column'}>
//       <DragDropContext
//         onDragEnd={(result, provided) => {
//           if (!result.destination) {
//             return
//           }
//           const moved = p.remove(result.source.index)
//           p.insert(result.destination.index, moved)
//         }}
//       >
//         <Droppable droppableId={'list'}>
//           {(provided, snapshot) => (
//             <div
//               {...provided.droppableProps}
//               ref={provided.innerRef}
//               style={{
//                 backgroundColor: snapshot.isDraggingOver ? '#C5C5C5' : undefined,
//               }}
//             >
//               {krav.map((s, i) => (
//                 <Draggable key={s.id} draggableId={`${s.id}`} index={i}>
//                   {(dprov, dsnap) => {
//                     if (dsnap.isDragging) {
//                       // Adjust location due to modal displacements
//                       const style = dprov.draggableProps.style as DraggingStyle
//                       const offset = {x: 115, y: 15 - (kravModal()?.scrollTop || 0)}
//                       const x = style.left - offset.x
//                       const y = style.top - offset.y
//                       style.left = x
//                       style.top = y
//                     }
//                     return (
//                       <div {...dprov.draggableProps} ref={dprov.innerRef}>
//                         <KravElement
//                           s={s}
//                           nummer={i + 1}
//                           update={(updated) => p.replace(i, updated)}
//                           remove={() => {
//                             console.log('remove' + i)
//                             p.remove(i)
//                           }}
//                           dragHandleProps={dprov.dragHandleProps}
//                           isDragging={dsnap.isDragging}
//                           p={p}
//                         />
//                       </div>
//                     )
//                   }}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//       <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale600} marginBottom={theme.sizing.scale600}>
//         <Button
//           type="button"
//           icon={faPlus}
//           marginLeft
//           label={'Suksesskriterie'}
//           $style={buttonBorderStyle}
//           kind="secondary"
//           size="compact"
//           disabled={krav.length >= 6}
//           // onClick={() => p.push({id: nextId(krav), navn: '', beskrivelse: ''})}
//         >
//           Suksesskriterie
//         </Button>
//       </Block>
//     </Block>
//   )
// }
//
// const KravElement = ({
//                     s,
//                     nummer,
//                     update,
//                     remove,
//                     dragHandleProps,
//                     isDragging,
//                     p
//                   }: {
//   s: Krav
//   nummer: number
//   update: (s: Krav) => void
//   remove: () => void
//   dragHandleProps?: DraggableProvidedDragHandleProps
//   isDragging: boolean
//   p: FieldArrayRenderProps
// }) => {
//   const debounceDelay = 500
//   const [navn, setNavn, navnInput] = useDebouncedState(s.navn, debounceDelay)
//   const [beskrivelse, setBeskrivelse] = useDebouncedState(s.beskrivelse || '', debounceDelay)
//
//   // useEffect(() => {
//   //   update({id: s.id, navn})
//   // }, [navn])
//
//   return (
//     <Card
//       overrides={{
//         Root: {
//           style: {
//             backgroundColor: isDragging ? '#F6E8E6' : ettlevColors.grey25,
//             marginBottom: theme.sizing.scale600,
//           },
//         },
//       }}
//     >
//       <Block position={'relative'} paddingTop={theme.sizing.scale100}>
//         <Block display={'flex'} alignItems={'flex-start'} position={'absolute'} right={0} top={0}>
//           <Button type={'button'} size={'compact'} kind={'tertiary'} $style={buttonBorderStyle} icon={faTrash} onClick={remove} tooltip={'Fjern suksesskriterie'}/>
//           <Block width={theme.sizing.scale1000}/>
//           <Block {...dragHandleProps}>
//             <FontAwesomeIcon icon={faGripVertical} aria-label={'Dra og slipp håndtak'}/>
//           </Block>
//         </Block>
//
//         <FormControl
//           label={
//             <Block display={'flex'} width={'100%'} justifyContent={'space-between'}>
//               <LabelWithTooltip
//                 label={`Suksesskriterie ${nummer}`}
//                 tooltip={
//                   'Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers.'
//                 }
//               />
//             </Block>
//           }
//         >
//           <Block>
//             <CustomizedInput
//               value={navnInput}
//               onChange={(e) => setNavn((e.target as HTMLInputElement).value)}
//               placeholder={'Navn'}
//             />
//             <Error fieldName={`suksesskriterier[${nummer - 1}].navn`} fullWidth/>
//           </Block>
//         </FormControl>
//         <FormControl label={<LabelWithTooltip label={'Beskrivelse av suksesskriteriet'} tooltip={'Nærmere detaljer rundt oppnåelse av suksesskriteriet.'}/>}>
//           {/* <MarkdownEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'} /> */}
//           <TextEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'}/>
//         </FormControl>
//       </Block>
//     </Card>
//   )
// }
