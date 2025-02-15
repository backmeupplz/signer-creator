import { Hono } from 'hono';
import { mnemonicToAccount } from 'viem/accounts';
import { cors } from "hono/cors";
import { fromHex } from 'viem';

const app = new Hono();

// Enable CORS for all routes (allow any origin)
app.use("*", cors());

// EIP-712 Domain and Types as defined in the Farcaster docs.
const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
};

const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
];

app.get('/signature', async (c) => {
  // Retrieve the key from query parameters.
  const key = c.req.query('key');
  if (!key) {
    return c.json(
      { error: "Missing 'key' query parameter." },
      400
    );
  }
  const deadline = c.req.query('deadline');
  if (!deadline) {
    return c.json(
      { error: "Missing 'deadline' query parameter." },
      400
    );
  }
  console.log(`Received request to sign key: ${key} with deadline: ${deadline}`);

  // Validate that the key is a valid 32-byte hex public key.
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    return c.json(
      { error: "Invalid public key format. Expected a 32-byte hex string (0x + 64 hex characters)." },
      400
    );
  }

  // Retrieve required environment variables.
  const appFid = process.env.APP_FID;
  const mnemonic = process.env.APP_MNEMONIC;
  if (!appFid || !mnemonic) {
    return c.json(
      { error: "Missing environment variables: APP_FID and/or APP_MNEMONIC." },
      500
    );
  }

  // Create an account from the mnemonic.
  const account = mnemonicToAccount(mnemonic);

  try {
    // Generate the signature using EIP-712 typed data.
    const signature = await account.signTypedData({
      domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
      types: {
        SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
      },
      primaryType: 'SignedKeyRequest',
      message: {
        requestFid: BigInt(appFid),
        key: fromHex(key as `0x${string}`, 'bytes'),
        deadline: BigInt(deadline),
      },
    });

    return c.json({ signature });
  } catch (err) {
    return c.json(
      { error: 'Error generating signature', details: err instanceof Error ? err.message : err },
      500
    );
  }
});

app.get('*', (c) => c.text('Not Found', 404));

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});
