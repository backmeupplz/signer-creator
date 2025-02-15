import {
  FarcasterNetwork,
  NobleEd25519Signer,
  makeUserDataAdd,
  UserDataType,
} from '@farcaster/hub-nodejs'
import {
  toBytes,
} from 'viem'
import submitMessage from './submitMessage'

const FC_NETWORK = FarcasterNetwork.MAINNET

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