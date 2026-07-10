import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path, status, message }) => {
				if (path === '/favicon.ico' && status === 404) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
