import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { POSTS } from "@/content/posts";

export const metadata: Metadata = {
  title: "Field Notes, The Blog",
  description:
    "Field notes from behind the camera. Broadcast operations, business plays, Athena diaries, and the occasional rant. Written by Howie Zales.",
};

export default function BlogPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="06"
          variant="blog"
          kicker="06 · Field Notes"
          title={"The blog."}
          greenWords={["blog."]}
          subtitle="Field notes from behind the camera. Broadcast operations, business plays, Athena diaries, and the occasional rant."
        />

        <section className="relative py-24 px-6 md:px-16">
          <div className="max-w-5xl mx-auto space-y-6">
            {POSTS.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-8 md:p-10 transition-colors duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-green">
                    <span>0{i + 1}</span>
                    <span className="text-text-dim">·</span>
                    <span>{post.tag}</span>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                    {post.read} · {post.date}
                  </div>
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-[-0.02em] leading-tight text-white group-hover:text-green transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-text-dim leading-7 max-w-2xl">
                  {post.excerpt}
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/70 group-hover:text-green transition-colors">
                    Read full note
                  </span>
                  <span className="font-mono text-sm text-green group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
