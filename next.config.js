/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		CONTRACT_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
	},
};

module.exports = nextConfig;
