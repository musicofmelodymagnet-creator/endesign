import * as migration_20260801_003547_initial from './20260801_003547_initial';

export const migrations = [
  {
    up: migration_20260801_003547_initial.up,
    down: migration_20260801_003547_initial.down,
    name: '20260801_003547_initial'
  },
];
