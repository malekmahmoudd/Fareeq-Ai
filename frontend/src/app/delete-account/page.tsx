import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function DeleteAccountPage() {
  return <main className="min-h-dvh bg-paper px-5 py-8"><article className="mx-auto max-w-2xl border-2 border-ink bg-paper-hi p-6">
    <Brand size="sm" />
    <h1 className="display my-6 text-3xl">Delete your FareeqAI account and data</h1>
    <p>You can delete your account using this website without installing the Android app.</p>
    <ol className="my-5 list-decimal space-y-3 ps-6"><li>Sign in to the FareeqAI account you want to delete.</li><li>Open Account and find Delete my account.</li><li>Type DELETE and confirm. This permanently erases the live workspace.</li></ol>
    <Link href="/account" className="btn btn-sun">Open Account to delete your data</Link>
    <p className="my-5">Deletion removes your account, chats, messages, files, extracted document text, memories, goals, plans and associated reply reports from the live service. Backups already taken expire under the operator’s retention policy. There is no undo.</p>
    <p>Android: Account → Delete account. Guests: Account → Delete guest workspace on the device holding the guest session. Guest work cannot be recovered without that session.</p>
    <Link href="/privacy" className="my-4 inline-block underline">Read the privacy notice</Link>
  </article></main>;
}
