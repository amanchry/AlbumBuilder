import "./globals.css";

export const metadata = {
  title: "Photo Album Builder",
  description: "Client-side photo album builder (open source)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
