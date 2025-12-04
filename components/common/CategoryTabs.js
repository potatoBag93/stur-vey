import styles from './CategoryTabs.module.css';

export default function CategoryTabs({ 
  categories = ['전체', '학업/진로', '대학생활', '취미/관심사', '소비/구매', '사회/이슈'],
  activeCategory = '전체',
  onCategoryChange
}) {
  return (
    <div className={styles.tabs}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.tab} ${activeCategory === category ? styles.active : ''}`}
          onClick={() => onCategoryChange?.(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
