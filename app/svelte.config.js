import netlifyAdapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: netlifyAdapter({
            // specify the runtime version
            runtime: 'nodejs16.x' // or 'nodejs18.x' if you prefer
        }),

        // other kit options...
    }
};

export default config;