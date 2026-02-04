export const metadata = {
  title: "RAnesthesia",
  description: "Public anesthesia resident education assistant (educational use only).",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#f6f7f9",
        }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
            }
          `,
          }}
        />
      </body>
    </html>
  );
}
