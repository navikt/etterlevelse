import Image from 'next/image'

const IconInCircle = (props: {
  icon: string
  alt: string
  size: number
  backgroundColor: string
}) => {
  const { icon, alt, size, backgroundColor } = props

  return (
    <div className={`bg-[${backgroundColor}] rounded-full p-[7.5%]`}>
      <Image src={icon} alt={alt} width={size} />
    </div>
  )
}

export default IconInCircle
