import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { UpdatePasswordForm } from "@/components/password-reset-forms";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi — TEDUHI",
  description: "Buat kata sandi baru untuk akun TEDUHI.",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <AuthHeading title="Buat kata sandi baru" subtitle="Gunakan kata sandi minimal 8 karakter." />
      <UpdatePasswordForm />
    </>
  );
}
