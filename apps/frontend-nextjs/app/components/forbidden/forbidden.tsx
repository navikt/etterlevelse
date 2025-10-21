import Image from 'next/image'

const ForbiddenPage = () => {
  return (
    <div>
      <Image src='/403-forbidden.png' alt='Forbidden' width={1536} height={1024} />
    </div>
  )
}

export default ForbiddenPage
