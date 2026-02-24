import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ noradId: string }>;
}

export default async function SatPage({ params }: Props) {
  const { noradId } = await params;
  redirect(`/dashboard?sat=${noradId}`);
}
