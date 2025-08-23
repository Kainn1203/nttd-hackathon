export function getUserTokenFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)slack_user_token=([^;]+)/);
  return m?.[1];
}
