import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {Block} from 'baseui/block'
import {Label2} from 'baseui/typography'
import {Select, Value} from 'baseui/select'
import {Button} from 'baseui/button'

import {StyledSpinnerNext} from 'baseui/spinner'
import {Cell, Row, Table} from '../../common/Table'
import {theme} from '../../../util'
import {codelist, CodeUsage} from '../../../services/Codelist'
import {ObjectLink} from '../../common/RouteLink'
import {ObjectType} from '../audit/AuditTypes'
import {replaceCodelistUsage} from '../../../api/CodelistApi'

const UsageTable = (props: {usage: CodeUsage, rows: number}) => {
  const {usage, rows} = props
  const krav = !!usage.krav.length
  return (
    <Table
      emptyText={'i bruk'}
      hoverColor={theme.colors.primary100}
      data={usage.inUse ? [0] : []}
      headers={[
        {title: 'Krav'}
      ]}
      render={table => Array.from(Array(rows).keys()).map(index => {
        const kr = usage.krav[index]
        return (
          <Row key={index} $style={{borderBottomStyle: 'none'}}>
            {krav && <Cell>
              {kr && <ObjectLink id={kr.id} type={ObjectType.Krav} withHistory={true}>{kr.name}</ObjectLink>}
            </Cell>}
          </Row>
        )
      })}/>
  )
}

export const Usage = (props: {usage?: CodeUsage, refresh: () => void}) => {
  const [showReplace, setShowReplace] = useState(false)
  const [newValue, setNewValue] = useState<Value>([])
  const ref = useRef<HTMLElement>()

  const {usage, refresh} = props
  const maxRows = usage ? Math.max(usage.krav.length) : -1
  const noUsage = maxRows === 0

  useEffect(() => {
    setShowReplace(false)
    setTimeout(() => ref.current && window.scrollTo({top: ref.current.offsetTop}), 200)
  }, [usage])

  const replace = async () => {
    await replaceCodelistUsage(usage!.listName, usage!.code, newValue[0].id as string)
    refresh()
  }

  return (
    <Block marginTop="2rem" ref={ref}>
      <Block display="flex" justifyContent="space-between" marginBottom=".5rem">
        <Label2 font="font450">Bruk</Label2>
        {!noUsage && <Button type="button" kind="secondary" size="compact" onClick={() => setShowReplace(true)}>Erstatt all bruk</Button>}
      </Block>

      {showReplace && usage && usage.listName && (
        <Block display="flex" margin="1rem" justifyContent="space-between">
          <Select size="compact"
                  maxDropdownHeight="300px" searchable={true} placeholder={'Ny verdi'}
                  options={codelist.getParsedOptions(usage.listName)} value={newValue} onChange={params => setNewValue(params.value)}/>
          <Button type="button" size="compact" onClick={replace} disabled={!newValue.length}>Erstatt</Button>
        </Block>
      )}

      {usage && <UsageTable usage={usage} rows={maxRows}/>}
      {!usage && <StyledSpinnerNext/>}
    </Block>
  )
}
