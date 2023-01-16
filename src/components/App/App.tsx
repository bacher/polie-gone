import { GameContainer } from '../GameContainer/GameContainer';

import styles from './App.module.scss';

export function App() {
  return (
    <div className={styles.wrapper}>
      <GameContainer />
    </div>
  );
}
