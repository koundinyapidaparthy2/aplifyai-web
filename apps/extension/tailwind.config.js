const sharedConfig = require('@aplifyai/config/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...sharedConfig,
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./index.html",
        "./popup.html",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
};
