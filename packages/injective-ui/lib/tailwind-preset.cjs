module.exports = {
  theme: {
    boxShadow: {
      glow: '0px 0px 10px rgba(255, 255, 255, 0.1)',
      'glow-lg': '0px 0px 20px rgba(255, 255, 255, 0.2)'
    },

    colors: {
      black: '#14151A',
      transparent: 'transparent',
      white: '#ffffff',

      primary: {
        500: '#00F2FE'
      },

      accent: {
        500: '#EA6D51'
      },

      gray: {
        300: '#F2F2F2',
        600: '#A1A1A3',
        700: '#727376',
        750: '#434448',
        800: '#232C39',
        900: '#171D29'
      },

      yellow: {
        600: '#F5CD6E'
      },

      green: {
        400: '#3EE8AF',
        600: '#0EE29B'
      },

      red: {
        400: '#FD6384',
        600: '#F3164D'
      },

      blue: {
        300: '#0076A5',
        400: '#80C2FF',
        600: '#0082FA'
      }
    },

    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      '2md': '800px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1366px',
      '3xl': '1440px',
      '4xl': '1681px'
    },

    extend: {
      height: {
        7.5: '1.875rem'
      },
      minHeight: {
        4: '1rem',
        6: '1.5rem',
        7.5: '1.875rem',
        8: '2rem'
      },
      minWidth: {
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        20: '5rem',
        40: '10rem',
        xs: '20rem',
        sm: '24rem'
      },
      maxWidth: {
        '90%': '90%'
      },
      width: {
        3.5: '0.875rem'
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '0.75rem' }],
        sm: ['0.875rem', { lineHeight: '0.875rem' }],
        base: ['1rem', { lineHeight: '1rem' }],
        xl: ['1.25rem', { lineHeight: '1.25rem' }],
        '3xl': ['2rem', { lineHeight: '2rem' }]
      }
    }
  }
}
