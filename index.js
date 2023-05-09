class AudioMixClient {
  /**
   * @param {Object} params
   * @param {Object} params.endpoint - The endpoint of the audio mix service
   * @param {Object} params.fetchOptions - Options to pass into the fetch request
   */
  constructor({ endpoint, fetchOptions } = {}) {
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
  }

  /**
   * @param {Object} options - The options for the constructor
   */
  static create(options) {
    return new AudioMixClient(options);
  }

  /**
   * @param {Object} payload - the payload for the api (i.e. { sources: [] ... })
   */
  async createMix(payload) {
    const createMixResponse = await fetch(`${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.fetchOptions,
      },
      body: JSON.stringify({
        ...payload,
        sources: payload.sources.map(({ src, volume }) => ({
          src,
          volume,
        })),
      }),
    });

    if (createMixResponse.ok) {
      return this.poll(createMixResponse.url);
    }

    throw new Error('Failed to create mix');
  }

  /**
   * Poll the status endpoint until the job is ready
   * @param {src} src
   * @returns {Object} Object containing a url to the generated file
   */
  async poll(src) {
    const response = await fetch(src, this.fetchOptions);

    // check if the job succeeded
    if (!response.ok) throw new Error('Failed to create mix');

    const { job, _url } = await response.json();

    if (job.status === 'STATUS_QUEUED' || job.status === 'STATUS_PROCESSING') {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((done) => setTimeout(() => done(), 2500));
      return this.poll(src);
    }

    if (job.status === 'STATUS_SUCCESS') return { url: _url };

    throw Error('Failed to create mix');
  }
}

export default AudioMixClient;
