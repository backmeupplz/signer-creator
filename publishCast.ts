import { toBytes } from 'viem'
import submitMessage from './submitMessage'
import { CastType, FarcasterNetwork, makeCastAdd, NobleEd25519Signer } from '@farcaster/hub-nodejs'

const FC_NETWORK = FarcasterNetwork.MAINNET

export default function publishCast({
  privateKey,
  text,
  url,
  fid,
}: { privateKey: `0x${string}`, text: string, url: string, fid: number }) {
  const privateKeyBytes = toBytes(privateKey)
  const signer = new NobleEd25519Signer(privateKeyBytes)
  return submitMessage(
    makeCastAdd(
      {
        text,
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
        embeds: [{
          url,
        }],
        type: CastType.CAST,
      },
      {
        fid,
        network: FC_NETWORK,
      },
      signer
    )
  )
}