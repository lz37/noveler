import { IBaseDTO, IDTO, IWebviewDTO } from '@common/types'
import { v4 as uuidv4 } from 'uuid'

export const genDTO = (data: Omit<IDTO, 'time' | 'uuid'> & Partial<IDTO>): IDTO => ({
  time: Date.now(),
  uuid: uuidv4(),
  ...data,
})

export const genWebviewDTO = (
  data: Omit<IWebviewDTO, 'time' | 'uuid'> & Partial<IWebviewDTO>,
  base?: IBaseDTO,
): IWebviewDTO => ({
  time: Date.now(),
  uuid: uuidv4(),
  sentTime: base?.time,
  sentUUID: base?.uuid,
  ...data,
})
