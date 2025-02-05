module.exports = {
  output: 'standalone',  // Add this line
  rewrites: async () => {
    return [
      {
        source: '/models',
        destination: '/api/models',
      },
      {
        source: '/v1/completions',
        destination: '/api/v1/completions',
      },
    ]
  },
}
