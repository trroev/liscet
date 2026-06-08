import * as migration_20260607_010817 from './20260607_010817';
import * as migration_20260608_174640_users_to_practitioner_fields from './20260608_174640_users_to_practitioner_fields';
import * as migration_20260608_181640 from './20260608_181640';
import * as migration_20260608_182804_courses from './20260608_182804_courses';

export const migrations = [
  {
    up: migration_20260607_010817.up,
    down: migration_20260607_010817.down,
    name: '20260607_010817',
  },
  {
    up: migration_20260608_174640_users_to_practitioner_fields.up,
    down: migration_20260608_174640_users_to_practitioner_fields.down,
    name: '20260608_174640_users_to_practitioner_fields',
  },
  {
    up: migration_20260608_181640.up,
    down: migration_20260608_181640.down,
    name: '20260608_181640',
  },
  {
    up: migration_20260608_182804_courses.up,
    down: migration_20260608_182804_courses.down,
    name: '20260608_182804_courses'
  },
];
