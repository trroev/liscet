export const HARD_DELETE_AFTER_DAYS = 30

/**
 * The date the account will be hard-deleted by the daily cron (#36):
 * `deletedAt` plus the 30-day grace period.
 */
export const getScheduledHardDeleteDate = ({
  deletedAt,
}: {
  deletedAt: Date
}): Date => {
  const scheduledFor = new Date(deletedAt)
  scheduledFor.setDate(scheduledFor.getDate() + HARD_DELETE_AFTER_DAYS)
  return scheduledFor
}
