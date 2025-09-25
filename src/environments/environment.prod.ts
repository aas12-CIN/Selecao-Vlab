export const environment = {
  production: true,
  apiKey: process.env['NG_APP_API_KEY'],
  apiUrl: process.env['NG_APP_API_URL'] || 'https://api.themoviedb.org/3'
};
