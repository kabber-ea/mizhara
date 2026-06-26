export function loginUrl(redirect?: string) {
  if (!redirect || redirect === "/login") return "/login";
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

export function signupUrl(redirect?: string) {
  if (!redirect) return "/signup";
  return `/signup?redirect=${encodeURIComponent(redirect)}`;
}

export function forgotPasswordUrl() {
  return "/forgot-password";
}

export function resolveAuthRedirect(searchParams: URLSearchParams, fallback = "/") {
  const redirect = searchParams.get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("/admin")) {
    return redirect;
  }
  return fallback;
}
