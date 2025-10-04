import { type FC } from 'react';
import classNames from 'classnames';
import styles from './YearDialog.module.css';

interface YearDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectYear: (yearOption: string) => void;
  selectedYear?: string;
}

const YEAR_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
];

export const YearDialog: FC<YearDialogProps> = ({
  isOpen,
  onClose,
  onSelectYear,
  selectedYear,
}) => {
  if (!isOpen) return null;

  const handleYearClick = (yearOption: string) => {
    onSelectYear(yearOption);
    onClose();
  };

  return (
    <div className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.yearList}>
          {YEAR_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={classNames(styles.yearItem, {
                [styles.selected]: selectedYear === option.value,
              })}
              onClick={() => handleYearClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
