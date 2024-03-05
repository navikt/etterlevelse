export const IconInCircle = (props: {
  icon: string
  alt: string
  size: string
  backgroundColor: string
}) => (
  <div className={`bg-[${props.backgroundColor}] rounded-full p-[7.5%]`}>
    <img src={props.icon} alt={props.alt} width={props.size} />
  </div>
)
