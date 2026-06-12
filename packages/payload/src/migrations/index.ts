import * as migration_20260607_010817 from './20260607_010817';
import * as migration_20260608_174640_users_to_practitioner_fields from './20260608_174640_users_to_practitioner_fields';
import * as migration_20260608_181640 from './20260608_181640';
import * as migration_20260608_182804_courses from './20260608_182804_courses';
import * as migration_20260608_183751_course_credits from './20260608_183751_course_credits';
import * as migration_20260608_185332_rule_sets_notification_log from './20260608_185332_rule_sets_notification_log';
import * as migration_20260609_130614_co_telehealth_registration from './20260609_130614_co_telehealth_registration';
import * as migration_20260609_170237_course_credit_versioning_and_license_status from './20260609_170237_course_credit_versioning_and_license_status';
import * as migration_20260609_192815_remove_co_license_state from './20260609_192815_remove_co_license_state';
import * as migration_20260609_222845_slug_field_on_users from './20260609_222845_slug_field_on_users';
import * as migration_20260611_195545_course_credit_dimensions from './20260611_195545_course_credit_dimensions';
import * as migration_20260612_191556_deleted_at_on_users from './20260612_191556_deleted_at_on_users';

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
    name: '20260608_182804_courses',
  },
  {
    up: migration_20260608_183751_course_credits.up,
    down: migration_20260608_183751_course_credits.down,
    name: '20260608_183751_course_credits',
  },
  {
    up: migration_20260608_185332_rule_sets_notification_log.up,
    down: migration_20260608_185332_rule_sets_notification_log.down,
    name: '20260608_185332_rule_sets_notification_log',
  },
  {
    up: migration_20260609_130614_co_telehealth_registration.up,
    down: migration_20260609_130614_co_telehealth_registration.down,
    name: '20260609_130614_co_telehealth_registration',
  },
  {
    up: migration_20260609_170237_course_credit_versioning_and_license_status.up,
    down: migration_20260609_170237_course_credit_versioning_and_license_status.down,
    name: '20260609_170237_course_credit_versioning_and_license_status',
  },
  {
    up: migration_20260609_192815_remove_co_license_state.up,
    down: migration_20260609_192815_remove_co_license_state.down,
    name: '20260609_192815_remove_co_license_state',
  },
  {
    up: migration_20260609_222845_slug_field_on_users.up,
    down: migration_20260609_222845_slug_field_on_users.down,
    name: '20260609_222845_slug_field_on_users',
  },
  {
    up: migration_20260611_195545_course_credit_dimensions.up,
    down: migration_20260611_195545_course_credit_dimensions.down,
    name: '20260611_195545_course_credit_dimensions',
  },
  {
    up: migration_20260612_191556_deleted_at_on_users.up,
    down: migration_20260612_191556_deleted_at_on_users.down,
    name: '20260612_191556_deleted_at_on_users'
  },
];
