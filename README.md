# sound-ws/sdk

A mini SDK to interact with the Sound Web Services API.

## Mix Audio

```js
import { WebCredentials, Mix } from '@soundws/sdk';

// or in node
// import { NodeCredentials } from '@soundws/sdk';
// new NodeCredentials(); // uses SWS_SECRET environment var to generate a token

const client = Mix.create({
  credentials: new WebCredentials({ accessToken: 'aToken' }),
});

const { url } = await client.createMix({
  filename: 'download-as-this-filename.wav',
  sources: [
    {
      src: 'https://your-cdn.com/stems/drums.wav',
      volume: 0.1,
    },
    {
      src: 'https://your-cdn.com/stems/vocals.wav',
      volume: 0.1,
    },
  ],
});
```
