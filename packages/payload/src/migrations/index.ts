import * as migration_20260607_010817 from './20260607_010817';
import * as migration_20260608_174640_users_to_practitioner_fields from './20260608_174640_users_to_practitioner_fields';

export const migrations = [
  {
    up: migration_20260607_010817.up,
    down: migration_20260607_010817.down,
    name: '20260607_010817',
  },
  {
    up: migration_20260608_174640_users_to_practitioner_fields.up,
    down: migration_20260608_174640_users_to_practitioner_fields.down,
    name: '20260608_174640_users_to_practitioner_fields'
  },
];
