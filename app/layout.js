import './globals.css';

export const metadata = {
  title: 'Aplikasi Uji Petik Fiber Optik | PSB & Gangguan',
  description: 'Sistem pencatatan dan rekapan uji petik instalasi fiber optik (ODP, Dropcore, S-Clamp, IKR)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen text-slate-800 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
