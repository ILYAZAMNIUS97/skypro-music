import styles from './Search.module.css';

export const Search = () => {
  return (
    <div className={styles.search}>
      <svg className={styles.searchSvg}>
        <use href="/img/icon/sprite.svg#icon-search"></use>
      </svg>
      <input
        className={styles.searchText}
        type="search"
        placeholder="Поиск"
        name="search"
      />
    </div>
  );
};
