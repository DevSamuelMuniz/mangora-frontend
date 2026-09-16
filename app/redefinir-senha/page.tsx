"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import BrandLogo from "@/components/brand/BrandLogo";
import { useT } from "@/i18n/provider";

export default function ResetPasswordPage() {
  const t = useT();
  const token = "validated-on-submit";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password)) return setError(t("publicPages.resetPassword.passwordRule"));
    if (password !== confirmation) return setError(t("publicPages.resetPassword.mismatch"));
    const rawToken = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!rawToken) return setError(t("publicPages.resetPassword.invalidLink"));

    try {
      setLoading(true);
      setError("");
      await apiRequest("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token: rawToken, newPassword: password }),
      });
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("publicPages.resetPassword.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mangora-public flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <BrandLogo className="h-11" priority />
        </Link>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-12 text-green-600" />
              <h1 className="mt-5 text-2xl font-black text-slate-950">{t("publicPages.resetPassword.successTitle")}</h1>
              <p className="mt-2 text-sm text-slate-500">{t("publicPages.resetPassword.successCopy")}</p>
              <Link href="/login" className="mt-6 flex h-11 items-center justify-center rounded-xl bg-orange-600 text-sm font-bold text-white">{t("publicPages.resetPassword.goToLogin")}</Link>
            </div>
          ) : (
            <>
              <KeyRound className="size-10 text-orange-600" />
              <h1 className="mt-5 text-2xl font-black text-slate-950">{t("publicPages.resetPassword.title")}</h1>
              <p className="mt-2 text-sm text-slate-500">{t("publicPages.resetPassword.subtitle")}</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700">{t("publicPages.resetPassword.newPasswordLabel")}<input name="password" type="password" required minLength={8} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}" autoComplete="new-password" className={inputClass} /></label>
                <label className="block text-xs font-bold text-slate-700">{t("publicPages.resetPassword.confirmLabel")}<input name="confirmation" type="password" required minLength={8} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}" autoComplete="new-password" className={inputClass} /></label>
                {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
                <button disabled={loading || !token} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-sm font-bold text-white disabled:opacity-60">{loading ? <><LoaderCircle className="size-4 animate-spin" />{t("publicPages.resetPassword.submitting")}</> : t("publicPages.resetPassword.submit")}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
