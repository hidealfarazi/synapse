/**
 * app/pr/[id]/page.tsx — Detail PR page.
 */

import { AssignmentDetailClient } from "@/components/AssignmentDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AssignmentDetailClient id={id} />;
}
