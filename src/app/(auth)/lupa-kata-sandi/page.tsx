import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { ForgotPasswordForm } from "@/components/password-reset-forms";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi — TEDUHI",
  description: "Kirim tautan untuk mengatur ulang kata sandi akun TEDUHI.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading title="Lupa kata sandi?" subtitle="Kami akan mengirim tautan untuk membuat kata sandi baru." />
      <ForgotPasswordForm />
    </>
  );
}
