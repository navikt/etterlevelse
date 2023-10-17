import * as React from 'react'
import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { LabelMedium } from 'baseui/typography'
import { Value } from 'baseui/select'
import { Button } from 'baseui/button'

import { Spinner } from 'baseui/spinner'
import { Cell, Row, Table } from '../../common/Table'
import { theme } from '../../../util'
import { codelist, CodeUsage } from '../../../services/Codelist'
import { ObjectLink } from '../../common/RouteLink'
import { ObjectType } from '../audit/AuditTypes'
import { replaceCodelistUsage } from '../../../api/CodelistApi'
import CustomizedSelect from '../../common/CustomizedSelect'
import { ettlevColors } from '../../../util/theme'
import { buttonContentStyle } from '../../common/Button'

const UsageTable = (props: { usage: CodeUsage }) => {
  const { usage } = props
  const krav = !!usage.krav.length
  const etterlevelseDokumentasjoner = !!usage.etterlevelseDokumentasjoner.length
  const codelist = !!usage.codelist.length

  const rows = usage ? Math.max(usage.krav.length, usage.etterlevelseDokumentasjoner.length, usage.codelist.length) : -1

  return (
    <Table
      emptyText={'i bruk'}
      hoverColor={theme.colors.primary100}
      data={usage.inUse ? [0] : []}
      headers={[
        { title: 'Krav', hide: !krav },
        { title: 'Etterlevelse Dokumentasjoner', hide: !etterlevelseDokumentasjoner },
        { title: 'Codelist', hide: !codelist },
      ].filter((v) => !!v)}
      render={(table) =>
        Array.from(Array(rows).keys()).map((index) => {
          const kr = usage.krav[index]
          const ed = usage.etterlevelseDokumentasjoner[index]
          const cl = usage.codelist[index]
          return (
            <Row key={index} $style={{ borderBottomStyle: 'none' }}>
              {krav && (
                <Cell>
                  {kr && (
                    <ObjectLink id={kr.id} type={ObjectType.Krav} withHistory={true}>
                      {kr.name}
                    </ObjectLink>
                  )}
                </Cell>
              )}
              {etterlevelseDokumentasjoner && (
                <Cell>
                  {ed && (
                    <ObjectLink id={ed.id} type={ObjectType.EtterlevelseDokumentasjon} withHistory={true}>
                      {ed.name}
                    </ObjectLink>
                  )}
                </Cell>
              )}
              {codelist && (
                <Cell>
                  {cl && (
                    <ObjectLink id={cl.list} type={ObjectType.Codelist} withHistory={true}>
                      {cl.list} - {cl.code}
                    </ObjectLink>
                  )}
                </Cell>
              )}
            </Row>
          )
        })
      }
    />
  )
}

export const Usage = (props: { usage?: CodeUsage; refresh: () => void }) => {
  const [showReplace, setShowReplace] = useState(false)
  const [newValue, setNewValue] = useState<Value>([])
  const ref = React.createRef<HTMLDivElement>()

  const { usage, refresh } = props

  useEffect(() => {
    setShowReplace(false)
    setTimeout(() => ref.current && window.scrollTo({ top: ref.current.offsetTop }), 200)
  }, [usage])

  const replace = async () => {
    await replaceCodelistUsage(usage!.listName, usage!.code, newValue[0].id as string)
    refresh()
  }

  return (
    <Block marginTop="2rem" ref={ref}>
      <Block display="flex" justifyContent="space-between" marginBottom=".5rem">
        <LabelMedium font="font450">Bruk</LabelMedium>
        {!!usage?.inUse && (
          <Button
            type="button"
            kind="secondary"
            size="compact"
            onClick={() => setShowReplace(true)}
            overrides={{
              BaseButton: {
                style: {
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Erstatt all bruk</strong>
          </Button>
        )}
      </Block>

      {showReplace && usage && usage.listName && (
        <Block display="flex" margin="1rem" justifyContent="space-between">
          <CustomizedSelect
            size="compact"
            maxDropdownHeight="300px"
            searchable={true}
            placeholder={'Ny verdi'}
            options={codelist.getParsedOptions(usage.listName)}
            value={newValue}
            onChange={(params) => setNewValue(params.value)}
          />
          <Button
            type="button"
            size="compact"
            onClick={replace}
            disabled={!newValue.length}
            overrides={{
              BaseButton: {
                style: {
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Erstatt</strong>
          </Button>
        </Block>
      )}

      {usage && <UsageTable usage={usage} />}
      {!usage && <Spinner $color={ettlevColors.green400} />}
    </Block>
  )
}
