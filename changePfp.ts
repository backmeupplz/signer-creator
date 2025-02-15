import {
  FarcasterNetwork,
  getInsecureHubRpcClient,
  type HubAsyncResult,
  Message,
  NobleEd25519Signer,
  makeUserDataAdd,
  UserDataType,
} from '@farcaster/hub-nodejs'
import {
  toBytes,
} from 'viem'

const HUB_URL = '34.172.154.21:2283'
const FC_NETWORK = FarcasterNetwork.MAINNET
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

export default function changePfp({
  privateKey,
  pfp,
  fid,
}: { privateKey: `0x${string}`, pfp: string, fid: number }) {
  const privateKeyBytes = toBytes(privateKey)
  const signer = new NobleEd25519Signer(privateKeyBytes)
  return submitMessage(
    makeUserDataAdd(
      {
        type: UserDataType.PFP,
        value: pfp,
      },
      {
        fid,
        network: FC_NETWORK,
      },
      signer
    )
  )
}