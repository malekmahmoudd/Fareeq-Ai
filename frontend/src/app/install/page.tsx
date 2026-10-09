import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function InstallPage() {
  return <main className="min-h-dvh bg-paper px-5 py-8"><article className="mx-auto max-w-2xl rounded-2xl border-2 border-ink bg-paper-hi p-6">
    <Brand size="sm" />
    <h1 className="display my-6 text-3xl">Add FareeqAI to your home screen</h1>
    <p>Open your AI team in its own window, with one tap. You can start as a guest and sign in later.</p>
    <h2 className="my-5 text-xl font-bold">iPhone and iPad · Safari</h2>
    <ol className="list-decimal space-y-3 ps-6"><li>Open fareeqai.pages.dev in Safari.</li><li>Tap Share, then Add to Home Screen. You may need to scroll through the actions.</li><li>If shown, keep Open as Web App enabled, then tap Add.</li></ol>
    <h2 className="my-5 text-xl font-bold">Android · Chrome</h2>
    <p>Open fareeqai.pages.dev, tap the browser menu, and select Install app or Add to Home screen.</p>
    <p className="my-5">An internet connection is required for AI replies and your workspace. Installing the web app is free and does not require an App Store account. The Android app is being prepared for Google Play.</p>
    <Link href="/" className="btn btn-sun">Open FareeqAI</Link>
    <nav className="mt-6 flex gap-5"><Link href="/privacy" className="underline">Privacy</Link><Link href="/delete-account" className="underline">Delete your data</Link></nav>
  </article></main>;
}
