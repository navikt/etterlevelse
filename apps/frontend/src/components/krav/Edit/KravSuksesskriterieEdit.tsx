import {FieldWrapper} from '../../common/Inputs'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import React, {useEffect} from 'react'
import {Suksesskriterie} from '../../../constants'
import {FormControl} from 'baseui/form-control'
import {Block} from 'baseui/block'
import {Input, SIZE} from 'baseui/input'
import Button, {buttonBorderStyle} from '../../common/Button'
import * as _ from 'lodash'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {MarkdownEditor} from '../../common/Markdown'
import {Card} from 'baseui/card'
import {theme} from '../../../util'
import {useDebouncedState} from '../../../util/hooks'


export const KravSuksesskriterierEdit = () => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterier'}>
        {p => <KriterieList p={p}/>}
      </FieldArray>
    </FieldWrapper>
  )
}

const nextId = (suksesskriterier: Suksesskriterie[]) => {
  const max = (_.max(suksesskriterier.map(s => s.id)) || 0)
  return max + 1
}

const KriterieList = ({p}: {p: FieldArrayRenderProps}) => {
  const suksesskriterier = p.form.values.suksesskriterier as Suksesskriterie[]
  return (
    <Block display={'flex'} flexDirection={'column'}>
      {suksesskriterier.map((s, i) => <Kriterie s={s} update={updated => {
        p.replace(i, updated)
      }
      }/>)}
      <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale200}>
        <Button
          type='button'
          icon={faPlus}
          marginLeft label={'Suksesskriterie'}
          $style={buttonBorderStyle}
          kind='tertiary'
          size='compact'
          disabled={suksesskriterier.length >= 5}
          onClick={() => p.push({id: nextId(suksesskriterier), navn: '', beskrivelse: ''})}
        >
          Suksesskriterie
        </Button>
      </Block>
    </Block>
  )
}

const Kriterie = ({s, update}: {s: Suksesskriterie, update: (s: Suksesskriterie) => void}) => {
  const debounceDelay = 500
  const [navn, setNavn, navnInput] = useDebouncedState(s.navn, debounceDelay)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(s.beskrivelse || '', debounceDelay)

  useEffect(() => {
    update({id: s.id, navn, beskrivelse})
  }, [navn, beskrivelse])

  return (
    <Card
      overrides={{
        Root: {
          style: {
            backgroundColor: '#F4F4F4',
            marginBottom: theme.sizing.scale600
          }
        }
      }}>
      <FormControl label={
        <LabelWithTooltip label={'Suksesskriterie'}
                          tooltip={'Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers.'}/>}>
        <Input
          size={SIZE.compact}
          value={navnInput}
          onChange={e => setNavn((e.target as HTMLInputElement).value)}
          placeholder={'Navn'}
        />
      </FormControl>
      <FormControl label={
        <LabelWithTooltip label={'Beskrivelse av suksesskriteriet'} tooltip={'Nærmere detaljer rundt oppnåelse av suksesskriteriet.'}/>}>
        <MarkdownEditor initialValue={beskrivelse} setValue={setBeskrivelse} height={'250px'}/>
      </FormControl>

    </Card>
  )
}
