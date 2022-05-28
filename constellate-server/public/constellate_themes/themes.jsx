const themes = {
  default: {
    head: <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&family=Source+Sans+Pro:ital,wght@0,300;0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      {/* <link href="https://fonts.googleapis.com/css2?family=Spline+Sans+Mono:wght@300..700&family=Spline+Sans:wght@300..700&display=swap" rel="stylesheet" /> */}
    </>,
    site_title: 'Constellate',
    site_logo: '/star.svg',
    global: {
      '#essay-title': {
        fontSize: '1.563rem',
        fontWeight: 700,
      },
    },
    // text_font: "'Source Serif Pro', serif",
    eui: {
      colors: {
        LIGHT: {
          primary: '#003EBF',
          accent: '#009ea3',
        },
        DARK: {
          primary: '#0092F2',
          accent: '#00A5C1',
        },
      },
      font: {
        family: "'Source Sans Pro', sans-serif",
        familyCode: "'Source Code Pro', monospace",
      },
    }
  },

  rho: {
    head: <>
      <link rel="stylesheet" href="https://use.typekit.net/ywt8hoe.css" />
      {/* <link rel="stylesheet" href="https://use.typekit.net/ush4rsn.css" /> */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/cascadia-code.min.css" />
    </>,
    site_title: "Pollard's Rho",
    site_logo: '/pollardsrho.svg',
    global: {
      '#essay-title': {
        fontSize: '1.563rem',
        fontWeight: 700,
      },
    },
    eui: {
      colors: {
        LIGHT: {
          primary: '#634DBF',
          accent: '#7C327C',
        },
        DARK: {
          primary: '#9881F3',
          accent: '#BD6BBD',
        },
      },
      font: {
        family: "'myriad-pro', sans-serif",
        familyCode: "'Cascadia Code', monospace",
        featureSettings: "'liga' 1, 'kern' 1, 'tnum' 1"
      },
    }
  }
};

export default themes;
