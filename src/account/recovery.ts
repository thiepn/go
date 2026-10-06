export function isPasswordRecoveryEvent(
  event: string,
): boolean {
  return event === 'PASSWORD_RECOVERY';
}
