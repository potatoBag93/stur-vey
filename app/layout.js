import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Stur-vey - 학생 설문조사 플랫폼",
  description: "학생들을 위한 설문조사 생성 및 응답 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={geistSans.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
