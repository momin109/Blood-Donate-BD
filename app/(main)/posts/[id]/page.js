"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Card } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/client";

// একটি পোস্টের আলাদা পেজ (Share/Copy Link-এর লিংক) — GET /api/posts/:id
export default function SinglePost({ params }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    let off = false;
    api(`/api/posts/${params.id}`)
      .then((d) => !off && setPost(d.post))
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [params.id, loading, user?.id]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> হোমে ফিরুন</Link>
      {error ? (
        <Card className="p-8 text-center text-sm text-brand-600">{error}</Card>
      ) : !post ? (
        <Card className="p-8 text-center text-sm text-ink-soft">লোড হচ্ছে…</Card>
      ) : (
        <PostCard post={post} onDeleted={() => router.replace("/")} />
      )}
    </div>
  );
}
