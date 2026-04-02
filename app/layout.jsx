import "./globals.css";

export const metadata = {
  title: "Jira Worklog Calendar",
  description: "View Jira worklogs in a month calendar without an external proxy.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
