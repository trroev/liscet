import * as migration_20260601_161326_initial from './20260601_161326_initial';

export const migrations = [
  {
    up: migration_20260601_161326_initial.up,
    down: migration_20260601_161326_initial.down,
    name: '20260601_161326_initial'
  },
];
