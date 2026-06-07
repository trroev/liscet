import * as migration_20260607_010817 from './20260607_010817';

export const migrations = [
  {
    up: migration_20260607_010817.up,
    down: migration_20260607_010817.down,
    name: '20260607_010817'
  },
];
