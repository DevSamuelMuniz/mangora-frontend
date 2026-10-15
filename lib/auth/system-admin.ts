const SYSTEM_ADMIN_EMAIL = "devsamuelmuniz@hotmail.com";

export function isSystemAdminEmail(email: string | null | undefined) {
  return email?.trim().toLocaleLowerCase("en-US") === SYSTEM_ADMIN_EMAIL;
}
