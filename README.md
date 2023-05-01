# soundws/audio-mix-service-client

A client to interact with the Audio Mix Service

## Mix Audio

```js
import Mix from '@soundws/audio-mix-service-client';

const client = Mix.create({
  fetchOptions: {
    headers: {
      Authorization: 'Bearer mytoken',
    },
  },
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
