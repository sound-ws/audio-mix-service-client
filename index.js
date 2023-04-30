import 'isomorphic-fetch';
import fetchRetry from 'fetch-retry';

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
    const response = await fetchRetry(fetch)(src, {
      retryOn: async (error, res) => {
        try {
          const { job } = await res.clone().json();
          return (
            error === null &&
            res.status === 200 &&
            ['STATUS_QUEUED', 'STATUS_PROCESSING'].indexOf(job.status) !== -1
          );
        } catch (err) {
          return false;
        }
      },
      retryDelay: 2500,
      ...this.fetchOptions,
    });

    // check if the job succeeded
    if (!response.ok) throw new Error('Failed to create mix');

    const { job, _url } = await response.json();

    if (job.status !== 'STATUS_SUCCESS') throw Error('Failed to create mix');

    return { url: _url };
  }
}

export default AudioMixClient;
