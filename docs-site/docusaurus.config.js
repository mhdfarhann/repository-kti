const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Repository KTI',
  tagline: 'Dokumentasi Teknis & Arsitektur Sistem Akademi Akupunktur Aceh',
  url: 'https://d837c85d.docs-repository-kti.pages.dev',
  baseUrl: '/',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/aaa-logo.png',
  organizationName: 'mhdfarhann', // Usually your GitHub org/user name.
  projectName: 'repository-kti', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/', // Serve the docs at the site's root path
        },
        blog: false, // Disable the blog feature
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Repository KTI AAA',
        logo: {
          alt: 'Logo Akademi Akupunktur Aceh',
          src: 'img/aaa-logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Dokumentasi',
          },
          {
            href: 'https://github.com/mhdfarhann/repository-kti',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dokumentasi',
            items: [
              {
                label: 'Arsitektur & Pengantar',
                to: '/',
              },
              {
                label: 'Skema Database',
                to: '/database',
              },
              {
                label: 'Integrasi Penyimpanan',
                to: '/storage',
              },
            ],
          },
          {
            title: 'Tautan Instansi',
            items: [
              {
                label: 'Akademi Akupunktur Aceh',
                href: 'https://acehakupunktur.ac.id/',
              },
            ],
          },
          {
            title: 'Sistem',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/mhdfarhann/repository-kti',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Akademi Akupunktur Aceh. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});
