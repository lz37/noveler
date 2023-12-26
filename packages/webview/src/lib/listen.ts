import { IBaseDTO } from '@common/types'

export default (event: MessageEvent<IBaseDTO>) => {
  const message = event.data
  console.log(message)
}
