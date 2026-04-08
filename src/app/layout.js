import '../../globals.css';

export const metadata = {
  title: 'Ashokan Around',
  description: 'Find accommodation partners for your internship or program',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
