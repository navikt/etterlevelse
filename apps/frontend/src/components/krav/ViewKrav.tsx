import {Krav} from '../../constants'
import {Block} from 'baseui/block'
import React, {useState} from 'react'
import {kravStatus} from '../../pages/KravPage'
import {theme} from '../../util'
import DataText from '../common/DataText'
import {Markdown} from '../common/Markdown'
import moment from 'moment'
import {PersonName} from '../common/PersonName'
import Button from '../common/Button'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({krav}: {krav: Krav}) => {
  const [expand, setExpand] = useState(false)

  return (
    <Block width='100%'>
      <Label title='Hensikt'>{krav.hensikt}</Label>
      <Label title='Beskrivelse' markdown={krav.beskrivelse}/>

      <Block height={theme.sizing.scale600}/>

      {expand && <AllInfo krav={krav}/>}
      {!expand && <Block display='flex'>
        <Block width='50%'>
          <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
        </Block>
        <Block width='50%'>
          <Label title='Kontaktpersoner'>
            <KontaktPersoner kontaktPersoner={krav.kontaktPersoner}/>
          </Label>
        </Block>
      </Block>}
      <Block display='flex' justifyContent='flex-end'>
        <Button onClick={() => setExpand(!expand)}>{`Vis ${expand ? 'mindre' : 'mer'} om krav`}</Button>
      </Block>
    </Block>
  )
}

const AllInfo = ({krav}: {krav: Krav}) => (
  <>
    <Label title='Utdypende beskrivelse' markdown={krav.utdypendeBeskrivelse}/>
    <Label title='Dokumentasjon' markdown={krav.dokumentasjon}/>
    <Label title='Rettskilder' markdown={krav.rettskilder}/>

    <Block height={theme.sizing.scale600}/>

    <Label title='Relevante implementasjoner' markdown={krav.implementasjoner}/>
    <Label title='Begreper'>{krav.begreper.join(', ')}</Label>
    <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
    <Label title='Relevant for'>{krav.relevansFor?.shortName}</Label>

    <Block height={theme.sizing.scale600}/>

    <Label title='Periode'>{krav.periode?.start && 'Fra:'} {formatDate(krav.periode?.start)} {krav.periode?.slutt && 'Til:'} {formatDate(krav.periode?.slutt)}</Label>

    <Block height={theme.sizing.scale600}/>

    <Label title='Kontaktpersoner'>
      <KontaktPersoner kontaktPersoner={krav.kontaktPersoner}/>
    </Label>
    <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
    <Label title='Underavdeling'>{krav.underavdeling?.shortName}</Label>
    <Label title='Status'>{kravStatus(krav.status)}</Label>
  </>
)

const KontaktPersoner = ({kontaktPersoner}: {kontaktPersoner: string[]}) => (
  <Block display='flex'>
    {kontaktPersoner.map((ident, i) =>
      <Block key={i} marginRight={theme.sizing.scale200}>
        <PersonName ident={ident} link/>
      </Block>
    )}
  </Block>
)

const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[]}) => {
  return (
    <DataText label={props.title}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
