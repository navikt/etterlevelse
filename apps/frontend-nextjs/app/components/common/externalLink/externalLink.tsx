import Link from 'next/link'
import { FunctionComponent } from 'react'

type TExternalLinkProps = {
  href: string
  className?: string
  label?: string
  children: React.ReactNode
  openOnSamePage?: boolean
  noNewTabLabel?: boolean
}

export const ExternalLink: FunctionComponent<TExternalLinkProps> = ({
  href,
  children,
  className,
  label,
  openOnSamePage,
  noNewTabLabel,
}) => (
  <Link
    className={className}
    href={href}
    target={openOnSamePage ? '_self' : '_blank'}
    rel='noopener noreferrer'
    aria-label={label}
  >
    {children} {!openOnSamePage && !noNewTabLabel && ' (åpner i en ny fane)'}
  </Link>
)
