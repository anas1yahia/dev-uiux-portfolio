module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
      extend: {

        cursor: {
            'row-resize': 'row-resize',
            'col-resize': 'col-resize',
          },

        animation: {
          'grid-pulse': 'gridPulse 10s ease-in-out infinite',
        },
        backdropFilter: {
          'none': 'none',
          'blur': 'blur(8px)',
        }
      }
    },
    plugins: [],
  }