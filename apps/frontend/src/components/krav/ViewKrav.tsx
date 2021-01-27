import {Krav} from '../../constants'
import {Block} from 'baseui/block'
import React, {useState} from 'react'
import {kravStatus} from '../../pages/KravPage'
import {theme} from '../../util'
import moment from 'moment'
import {PersonName} from '../common/PersonName'
import Button from '../common/Button'
import {DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {Label} from '../common/PropertyLabel'
import {ObjectLink} from '../common/RouteLink'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewKrav = ({krav}: {krav: Krav}) => {
  const [expand, setExpand] = useState(false)

  return (
    <Block width='100%'>
      <Label title='Hensikt'>{krav.hensikt}</Label>
      <Label title='Beskrivelse' markdown={krav.beskrivelse}/>

      <Block height={theme.sizing.scale800}/>

      {expand && <AllInfo krav={krav}/>}
      {!expand && <MediumInfo krav={krav}/>}
      <Block display='flex' justifyContent='flex-end'>
        <Button onClick={() => setExpand(!expand)}>{`Vis ${expand ? 'mindre' : 'mer'} om krav`}</Button>
      </Block>
    </Block>
  )
}

const MediumInfo = ({krav}: {krav: Krav}) => (
  <>
    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Block display='flex'>
      <Block width='50%'>
        <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
      </Block>
      <Block width='50%'>
        <Label title='Kontaktpersoner'>
          <KontaktPersoner kontaktPersoner={krav.kontaktPersoner}/>
        </Label>
      </Block>
    </Block>
  </>
)

const AllInfo = ({krav}: {krav: Krav}) => (
  <>
    <Label title='Utfyllende beskrivelse' markdown={krav.utdypendeBeskrivelse}/>
    <Label title='Endringer fra forrige versjon' markdown={krav.versjonEndringer}/>
    <Label title='Dokumentasjon' markdown={krav.dokumentasjon}/>
    <Label title='Rettskilder' markdown={krav.rettskilder}/>

    <Label title='Tagger'>{krav.tagger.join(', ')}</Label>
    <Label title='Kravet er relevant for'><DotTags list={ListName.RELEVANS} codes={krav.relevansFor} linkCodelist/></Label>
    <Label title='Relevante implementasjoner' markdown={krav.implementasjoner}/>
    <Label title='Begreper'>{krav.begreper.join(', ')}</Label>

    {krav.periode?.start && <Label title='Gyldig fom'>{formatDate(krav.periode?.start)}</Label>}
    {krav.periode?.slutt && <Label title='Gyldig tom'>{formatDate(krav.periode?.slutt)}</Label>}

    <Label title='Status'>{kravStatus(krav.status)}</Label>
    <Label title='Kontaktpersoner'>
      <KontaktPersoner kontaktPersoner={krav.kontaktPersoner}/>
    </Label>
    <Label title='Avdeling'>{krav.avdeling?.shortName}</Label>
    <Label title='Underavdeling'><ObjectLink id={krav.underavdeling?.code} type={ListName.UNDERAVDELING}>{krav.underavdeling?.shortName}</ObjectLink></Label>
  </>
)

const KontaktPersoner = ({kontaktPersoner}: {kontaktPersoner: string[]}) => (
  <Block display='flex' flexWrap>
    {kontaktPersoner.map((ident, i) =>
      <Block key={i} marginRight={theme.sizing.scale200}>
        <PersonName ident={ident} link/>
      </Block>
    )}
  </Block>
)
