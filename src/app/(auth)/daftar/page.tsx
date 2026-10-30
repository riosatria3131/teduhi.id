import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Daftar — TEDUHI",
  description: "Buat akun TEDUHI untuk melaporkan dan memantau perbaikan fasilitas umum.",
};

export default function DaftarPage() {
  return (
    <>
      <AuthHeading title="Mulai daftar" />
      <RegisterForm />
    </>
  );
}
