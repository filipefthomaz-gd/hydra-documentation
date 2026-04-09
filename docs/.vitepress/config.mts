import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Hydra',
  description: 'HYbrid Dynamically Responsive Audio — OCEAN adaptive audio system',
  base: '/hydra-documentation/',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/hydra-documentation/favicon.png' }]
  ],


  themeConfig: {
    logo: '/favicon.png',

    nav: [
      { text: 'Guide',     link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/components' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started',  link: '/guide/getting-started' },
          { text: 'Audio Tracks',     link: '/guide/audio-tracks' },
          { text: 'Transitions',      link: '/guide/transitions' },
          { text: 'Sequences',        link: '/guide/sequences' },
          { text: 'Vertical Mixing',  link: '/guide/vertical-mixing' },
          { text: 'Spatial Audio',    link: '/guide/spatial' },
          { text: 'Variation',        link: '/guide/variation' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Components',  link: '/reference/components' },
          { text: 'API',         link: '/reference/api' },
        ],
      },
    ],

    footer: {
      message: 'HYDRA — HYbrid Dynamically Responsive Audio · Part of the OCEAN framework.',
    },

    search: {
      provider: 'local',
    },
  },
})
