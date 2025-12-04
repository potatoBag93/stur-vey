import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
