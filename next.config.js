const nextConfig = {
	webpack: (config, { dev }) => {
		// Enable source maps in development mode
		if (dev) {
			config.devtool = 'source-map';
		}
		return config;
	},
	experimental: {
		serverComponentsExternalPackages: [
			'puppeteer-extra',
			'puppeteer-extra-plugin-stealth',
			'puppeteer-extra-plugin-recaptcha',
		],
	},
};

module.exports = nextConfig;