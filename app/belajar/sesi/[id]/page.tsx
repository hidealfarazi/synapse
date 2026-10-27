/**
 * app/belajar/sesi/[id]/page.tsx — Sesi belajar 4 langkah
 */
import { SesiBelajarClient } from "@/components/SesiBelajarClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SesiPage({ params }: PageProps) {
  const { id } = await params;
  return <SesiBelajarClient id={id} />;
}
