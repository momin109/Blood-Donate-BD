import PostCard from "@/components/PostCard";
import AdCard from "@/components/AdCard";

// বিজ্ঞাপন Admin → Advertisements থেকে আসে (GET /api/ads)। প্রতিটি বিজ্ঞাপন নিজের "every" (৫–৭) পোস্ট পরপর দেখায়;
// একই জায়গায় একাধিক পড়লে প্রথমটি দেখানো হয়।
export default function Feed({ posts, ads = [], onDeleted }) {
  const out = [];
  posts.forEach((p, i) => {
    out.push(
      <div key={`p${p.id}`} id={`post-${p.id}`}>
        <PostCard post={p} onDeleted={onDeleted} />
      </div>,
    );
    const n = i + 1;
    if (n < posts.length) {
      const ad = ads.find((a) => n % a.every === 0);
      if (ad) out.push(<AdCard key={`ad${ad.id}-${n}`} ad={ad} />);
    }
  });
  return <div className="space-y-5">{out}</div>;
}
