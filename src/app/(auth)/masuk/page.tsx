import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Masuk — TEDUHI",
  description: "Masuk ke TEDUHI untuk membuat dan memantau laporan kerusakan fasilitas umum.",
};

export default function MasukPage() {
  return (
    <>
      <AuthHeading title="Masuk ke TEDUHI" subtitle="Lanjutkan melapor dan pantau perbaikan fasilitas di sekitar Anda." />
      <LoginForm />
    </>
  );
}
