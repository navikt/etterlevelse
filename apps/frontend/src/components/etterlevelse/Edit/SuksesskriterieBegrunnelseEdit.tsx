import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { H3, Label3, Paragraph2 } from 'baseui/typography'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React from 'react'
import { EtterlevelseStatus, Suksesskriterie, SuksesskriterieBegrunnelse } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors, theme } from '../../../util/theme'
import { CustomizedAccordion, CustomizedPanel } from '../../common/CustomizedAccordion'
import { FieldWrapper } from '../../common/Inputs'
import { Markdown } from '../../common/Markdown'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'
import LabelWithToolTip from '../../common/LabelWithTooltip'
import { borderColor, borderStyle, borderWidth } from '../../common/Style'
import { LabelAboveContent } from '../../common/PropertyLabel'
import { MODE, StatefulButtonGroup } from 'baseui/button-group'
import { Button } from 'baseui/button'
import { buttonContentStyle } from '../../common/Button'
import { size } from 'lodash'

const paddingLeft = '30px'

export const getSuksesskriterieBegrunnelse = (suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[], suksessKriterie: Suksesskriterie) => {
  const sb = suksesskriterieBegrunnelser.find((item) => {
    return item.suksesskriterieId === suksessKriterie.id
  })
  if (!sb) {
    return { suksesskriterieId: suksessKriterie.id, begrunnelse: '', oppfylt: false, ikkeRelevant: false, behovForBegrunnelse: suksessKriterie.behovForBegrunnelse }
  } else {
    return sb
  }
}

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie, disableEdit, viewMode }: { suksesskriterie: Suksesskriterie[]; disableEdit: boolean; viewMode: boolean }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>
        {(p) => <KriterieBegrunnelseList props={p} disableEdit={disableEdit} suksesskriterie={suksesskriterie} viewMode={viewMode} />}
      </FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({
  props,
  suksesskriterie,
  disableEdit,
  viewMode,
}: {
  props: FieldArrayRenderProps
  suksesskriterie: Suksesskriterie[]
  disableEdit: boolean
  viewMode: boolean
}) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <Block key={s.navn + '_' + i}>
            <KriterieBegrunnelse
              status={props.form.values.status}
              disableEdit={disableEdit}
              suksesskriterie={s}
              index={i}
              suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
              update={(updated) => props.replace(i, updated)}
              props={props}
              viewMode={viewMode}
              totalSuksesskriterie={suksesskriterie.length}
            />
          </Block>
        )
      })}
    </Block>
  )
}

const KriterieBegrunnelse = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  disableEdit,
  update,
  status,
  props,
  viewMode,
  totalSuksesskriterie
}: {
  suksesskriterie: Suksesskriterie
  index: number
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (s: SuksesskriterieBegrunnelse) => void
  status: string
  props: FieldArrayRenderProps
  viewMode: boolean
  totalSuksesskriterie: number
  
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const debounceDelay = 500
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)
  const [oppfylt, setOppfylt] = React.useState(suksesskriterieBegrunnelse.oppfylt || false)
  const [ikkerelevant, setIkkeRelevant] = React.useState(suksesskriterieBegrunnelse.ikkeRelevant || false)

  React.useEffect(() => {
    update({
      suksesskriterieId: suksesskriterie.id,
      begrunnelse: begrunnelse,
      oppfylt: oppfylt,
      ikkeRelevant: ikkerelevant,
      behovForBegrunnelse: suksesskriterie.behovForBegrunnelse,
    })
  }, [begrunnelse, oppfylt, ikkerelevant])

  const getBorderColor = () => {
    if (status === EtterlevelseStatus.FERDIG || status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
      if (!begrunnelse && suksesskriterie.behovForBegrunnelse) {
        return { border: '2px solid #842D08' }
      } else {
        return { border: '1px solid #C9C9C9' }
      }
    } else {
      return { border: '1px solid #C9C9C9' }
    }
  }
  const getBackgroundColor = () => {
    if (viewMode === true) {
      return ettlevColors.grey50
    } else {
      if (status === EtterlevelseStatus.IKKE_RELEVANT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
        return ettlevColors.grey50
      } else {
        return ettlevColors.white
      }
    }
  }

  return (
    <Block $style={getBorderColor()} backgroundColor={getBackgroundColor()} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
      <Block display='flex' justifyContent='space-between' width='100%' alignItems='center'>
      <Block><Paragraph2 $style={{
        fontSize: '16px',
        lineHeight: '18,75',
        marginTop: '3px',
        marginBottom: '5px',
        font: 'roboto',
        color: ettlevColors.grey600
      }}>Suksesskriterie {index +1} av {totalSuksesskriterie}</Paragraph2></Block>
    {viewMode === true && (<Block alignSelf='flex-end'>
    <Paragraph2
            $style={{
              marginTop: '0px',
              marginBottom: '0px',
              color: ettlevColors.red600,
              fontStyle: 'italic',
            }}
          >
            Ikke relevant
          </Paragraph2>
        </Block>)}
        </Block>
      <H3 color={ettlevColors.green800} marginTop="0px">
        {suksesskriterie.navn}
      </H3>

      {(status === EtterlevelseStatus.IKKE_RELEVANT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ) && (
        <Block width="100%" display="flex" justifyContent="flex-end" marginTop="20px" marginBottom="-29px">
          <Paragraph2
            $style={{
              marginTop: '0px',
              marginBottom: '0px',
              color: ettlevColors.red600,
              fontStyle: 'italic',
            }}
          >
            Ikke relevant
          </Paragraph2>
        </Block>
      )}
      <CustomizedAccordion>
        <CustomizedPanel
          title={<Label3 $style={{ color: ettlevColors.green600 }}>Utfyllende om kriteriet</Label3>}
          overrides={{
            Header: {
              style: {
                backgroundColor: getBackgroundColor(),
                maxWidth: '210px',
                paddingLeft: '0px',
                ':hover': {
                  boxShadow: 'none',
                },
              },
            },
            Content: {
              style: {
                backgroundColor: getBackgroundColor(),
                borderBottomWidth: 'none',
                borderBottomStyle: 'none',
                borderBottomColor: 'none',
                paddingLeft: '0px',
              },
            },
            PanelContainer: {
              style: {
                ...borderStyle('hidden'),
                backgroundColor: getBackgroundColor()
              },
            },
          }}
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </CustomizedPanel>
      </CustomizedAccordion>

      {viewMode === false && (
        <>
          <Block width="100%" height="1px" backgroundColor={ettlevColors.grey100} marginTop="24px" marginBottom="24px" />

          {status !== EtterlevelseStatus.IKKE_RELEVANT && status !== EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT && (
            <StatefulButtonGroup mode={MODE.radio} initialState={{ selected: oppfylt ? 0 : ikkerelevant ? 1 : [] }}>
              <Button
                type={'button'}
                disabled={status === EtterlevelseStatus.IKKE_RELEVANT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT}
                overrides={{
                  BaseButton: {
                    style: {
                      ...borderColor(ettlevColors.green800),
                      ...borderStyle('solid'),
                      ...borderWidth('1px'),
                      ...buttonContentStyle,
                      borderRightWidth: '0px',
                      borderTopRightRadius: '0px',
                      borderBottomRightRadius: '0px',
                      minWidth: '160px',
                    },
                    props: {
                      tabIndex: 0,
                    },
                  },
                }}
                onClick={() => {
                  setOppfylt(!oppfylt)
                  setIkkeRelevant(false)
                }}
              >
                Oppfylt
              </Button>
              <Button
                type={'button'}
                disabled={status === EtterlevelseStatus.IKKE_RELEVANT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT}
                overrides={{
                  BaseButton: {
                    style: {
                      ...borderColor(ettlevColors.green800),
                      ...borderStyle('solid'),
                      ...borderWidth('1px'),
                      ...buttonContentStyle,
                      borderTopLeftRadius: '0px',
                      borderBottomLeftRadius: '0px',
                      minWidth: '160px',
                    },
                    props: {
                      tabIndex: 0,
                    },
                  },
                }}
                onClick={() => {
                  setIkkeRelevant(!ikkerelevant)
                  setOppfylt(false)
                }}
              >
                Ikke relevant
              </Button>
            </StatefulButtonGroup>
          )}
        </>
      )}

      {(oppfylt || ikkerelevant) &&
        status !== EtterlevelseStatus.IKKE_RELEVANT &&
        status !== EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT &&
        !disableEdit &&
        suksesskriterie.behovForBegrunnelse && (
          <Block marginTop={theme.sizing.scale1000}>
            <FormControl label={<LabelWithToolTip label={oppfylt ? 'Hvordan oppfylles kriteriet?' : 'Hvorfor er ikke kriteriet relevant?'} />}>
              <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} errors={props.form.errors} simple width="100%" />
            </FormControl>
            <Error fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`} fullWidth={true} />
          </Block>
        )}

      {(oppfylt || ikkerelevant) && disableEdit && (
        <Block paddingLeft={paddingLeft} marginTop={theme.sizing.scale1000}>
          <LabelAboveContent title="Dokumentasjon" markdown={begrunnelse} />
        </Block>
      )}
    </Block>
  )
}
