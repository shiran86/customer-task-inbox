export const appConfig = {
  baseUrl: 'https://s.priority-connect.online',
  prettyName: 'asd42',
  companyName: 'a270423',
  lang: 1,
  company: 'a270423',
  tabuleIni: 'tabasd42',
  primaryColor: '#3B37E6',
} as const;

export function getApiBaseUrl(): string {
  return `/odata/Priority/tab${appConfig.prettyName}.ini/${appConfig.companyName}`;
}

export function getTextDirection(): 'rtl' | 'ltr' {
  return appConfig.lang === 1 ? 'rtl' : 'ltr';
}

export function getCredentials(): { user: string; password: string } {
  const user = import.meta.env.VITE_PRIORITY_USER;
  const password = import.meta.env.VITE_PRIORITY_PASSWORD;

  if (!user || !password) {
    throw new Error('Missing Priority credentials. Set VITE_PRIORITY_USER and VITE_PRIORITY_PASSWORD in .env.local');
  }

  return { user, password };
}
