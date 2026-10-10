import PostCard from "@/components/PostCard";
import AdCard from "@/components/AdCard";

// Show an ad after every AD_EVERY posts (choose any number between 5 and 7)
export const AD_EVERY = 6;

export default function Feed({ posts }) {
  const out = [];
  posts.forEach((p, i) => {
    out.push(<div key={`p${p.id}`} id={`post-${p.id}`}><PostCard post={p} /></div>);
    if ((i + 1) % AD_EVERY === 0 && i + 1 < posts.length) out.push(<AdCard key={`ad${i}`} index={Math.floor(i / AD_EVERY)} />);
  });
  return <div className="space-y-5">{out}</div>;
}
