import ProfileView from "@/components/ProfileView";

export default function DonorProfile({ params }) {
  return <div className="mx-auto w-full min-w-0 max-w-4xl"><ProfileView donorId={params.id} /></div>;
}
