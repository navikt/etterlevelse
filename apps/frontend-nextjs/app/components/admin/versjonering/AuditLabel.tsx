import { Label } from '@navikt/ds-react'

export const AuditLabel = (props: { label: string; children: any }) => {
  return (
    <div className='flex'>
      <div className='flex w-1/5 self-center'>
        <Label>{props.label}</Label>
      </div>
      {props.children}
    </div>
  )
}
