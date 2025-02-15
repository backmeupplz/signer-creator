import {
  getInsecureHubRpcClient,
  type HubAsyncResult,
  Message,
} from '@farcaster/hub-nodejs'

const HUB_URL = '34.172.154.21:2283'
const hubClient = getInsecureHubRpcClient(HUB_URL)

const submitMessage = async (resultPromise: HubAsyncResult<Message>) => {
  const result = await resultPromise
  if (result.isErr()) {
    throw new Error(`Error creating message: ${result.error}`)
  }
  const messageSubmitResult = await hubClient.submitMessage(result.value)
  if (messageSubmitResult.isErr()) {
    throw new Error(
      `Error submitting message to hub: ${messageSubmitResult.error}`
    )
  }
}

export default submitMessage