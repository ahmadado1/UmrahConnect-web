// Smart download link for the general QR code: https://myumrahconnect.com/get
// iPhone/iPad -> App Store, Android -> Google Play, computers -> the home page download section.
const APP_STORE = "https://apps.apple.com/app/id6778753426"
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.myumrahconnect.app"

// Check every visitor (never cache one store's answer for everyone)
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  const ua = (request.headers.get("user-agent") || "").toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return Response.redirect(APP_STORE, 302)
  if (/android/.test(ua)) return Response.redirect(PLAY_STORE, 302)
  return Response.redirect(new URL("/#download", request.url), 302)
}
