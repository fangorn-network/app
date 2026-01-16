import { Providers } from './providers/providers';
import './globals.css';
import { cookieToInitialState } from 'wagmi';
import { getConfig } from './wagmi-config';
import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie')
  )

  console.log('initial state', initialState);

  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>
            {children}
        </Providers>
      </body>
    </html>
  );
}