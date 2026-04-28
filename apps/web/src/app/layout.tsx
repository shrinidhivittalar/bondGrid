import './global.css';

export const metadata = {
  title: 'bond_grid',
  description: 'bond_grid web application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
