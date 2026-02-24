import { redirect } from "next/navigation";

interface Props {
  params: { noradId: string };
}

export default function SatPage({ params }: Props) {
  // Redirect to dashboard; the client can handle selection via URL
  redirect(`/dashboard?sat=${params.noradId}`);
}
