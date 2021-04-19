import { FieldWrapper } from '../../common/Inputs'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { useState } from 'react'
import { Krav, Suksesskriterie } from '../../../constants'
import { FormControl } from 'baseui/form-control'
import { FormikProps } from 'formik/dist/types'
import { Block } from 'baseui/block'
import { Input } from 'baseui/input'
import Button from '../../common/Button'
import { RenderTagList } from '../../common/TagList'
import * as _ from 'lodash'
import LabelWithTooltip from '../../common/LabelWithTooltip'



export const KravSuksesskriterierEdit = () => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterier'}>
        {p => <KriterieList p={p} />}
      </FieldArray>
    </FieldWrapper>
  )
}

const nextId = (suksesskriterier: Suksesskriterie[]) => {
  const max = (_.max(suksesskriterier.map(s => s.id)) || 0)
  return max + 1
}

const KriterieList = ({ p }: { p: FieldArrayRenderProps }) => {
  const form = p.form as FormikProps<Krav>

  const [id, setId] = useState<number>(nextId(form.values.suksesskriterier))
  const [navn, setNavn] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const onClick = (p: FieldArrayRenderProps, i: number) => {
    setNavn(p.form.values.suksesskriterier[i].navn)
    setId(p.form.values.suksesskriterier[i].id)
    p.remove(i)
    inputRef?.current?.focus()
  }

  const add = () => {
    if (!navn) return
    p.push({ id: id === -1 ? nextId(form.values.suksesskriterier) : id, navn })
    setNavn('')
    setId(-1)
  }

  const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()
  return (
    <FormControl label={<LabelWithTooltip label={'Suksesskriterier'} tooltip={'Definer hvilke kriterier som skal til for at kravet er oppnådd. Formålet er å identifisere en terskel for kravoppnåelse og en enhetlig besvarelse på tvers.'} />} >
      <Block>
        <Block display='flex' height='40px'>
          <Input onKeyDown={onKey} value={navn} inputRef={inputRef}
            onChange={e => setNavn((e.target as HTMLInputElement).value)}
            onBlur={add} placeholder={'Suksesskriterie'}
          />
          <Block minWidth='107px'>
            <Button
              type='button'
              onClick={add}
              marginLeft label={'Legg til'}
              $style={{ border: '2px solid #102723', borderRadius: '4px' }}
              kind='tertiary'
              size='compact'
            >
              Legg til
              </Button>
          </Block>
        </Block>
        <RenderTagList
          list={form.values.suksesskriterier.map(s => `${s.id}: ${s.navn}`)}
          onRemove={p.remove}
          onClick={(i) => onClick(p, i)} />
      </Block>
    </FormControl>
  )
}
