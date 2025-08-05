import { warningAlert } from "@/components/others/images/images";
import { Detail } from "@navikt/ds-react";

export const ShowWarningMessage = ({ warningMessage }: { warningMessage: string }) => (
  <div className='flex items-center gap-2'>
    <img src={warningAlert} width='18px' height='18px' alt='warning icon' />
    <Detail className='whitespace-nowrap'>{warningMessage}</Detail>
  </div>
)