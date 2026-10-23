import ddocPreset from '@fileverse-dev/ddoc/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
  // ddoc 7 needs Tailwind 3 with its preset; it generates the editor's
  // classes from both dist globs (see the ddoc README).
  presets: [ddocPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@fileverse-dev/ddoc/dist/**/*.{js,mjs}',
    './node_modules/@fileverse/ui/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      fontFamily: {
        helvetica: ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
}
