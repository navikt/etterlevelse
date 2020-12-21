import {Block} from 'baseui/block'
import React from 'react'
import {theme} from '../../util'
import {TeamName} from '../common/TeamName'
import {DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {HeadingSmall, LabelMedium} from 'baseui/typography'
import {ObjectLink} from '../common/RouteLink'
import {ObjectType} from '../admin/audit/AuditTypes'
import {etterlevelseName} from '../../pages/EtterlevelsePage'
import {Behandling, Etterlevelse} from '../../constants'
import {Label} from '../common/PropertyLabel'

export const ViewBehandling = ({behandling, etterlevelser}: {behandling: Behandling, etterlevelser: Etterlevelse[]}) => {

  return (
    <Block>
      <Block>
        <Label title='Navn'>{behandling.navn}</Label>
        <Label title='Nummer'>{behandling.nummer}</Label>
        <Label title='Overordnet formål'>{behandling.overordnetFormaal.shortName}</Label>
        <Label title=''>{behandling.overordnetFormaal.description}</Label>
        <Label title='Formål'>{behandling.formaal}</Label>

        <Label title='Avdeling'>{behandling.avdeling?.shortName}</Label>
        <Label title='Linjer'>{behandling.linjer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Systemer'>{behandling.systemer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Team'>
          <Block display='flex' flexWrap>
            {behandling.teams.map(t =>
              <Block key={t} marginRight={theme.sizing.scale600}>
                <TeamName id={t} link/>
              </Block>
            )}
          </Block>
        </Label>
        <Label title={'Relevans'}><DotTags list={ListName.RELEVANS} codes={behandling.relevansFor} linkCodelist/></Label>
      </Block>

      <Block marginTop={theme.sizing.scale2400}>
        <HeadingSmall>Etterlevelser</HeadingSmall>
        {etterlevelser.map((e) => {
          return (
            <Block key={e.id}>
              <ObjectLink id={e.id} type={ObjectType.Etterlevelse}>
                <LabelMedium>{etterlevelseName(e)}</LabelMedium>
              </ObjectLink>
            </Block>
          )
        })}
      </Block>
    </Block>
  )
}
