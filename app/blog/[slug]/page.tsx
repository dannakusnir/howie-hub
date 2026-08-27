import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/content/posts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.isoDate,
      authors: [post.author],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return notFound();

  const otherPosts = POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  const base = "https://howiezales.com";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${base}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    author: { "@type": "Person", name: post.author, url: base },
    publisher: {
      "@type": "Organization",
      name: "Howie Zales · Operator Mindset Hub",
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/howie-profile.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${base}/blog/${post.slug}`,
    },
    keywords: [post.tag, "Howie Zales", "Operator Mindset"].join(", "),
    articleSection: post.tag,
    wordCount: post.read.replace(/\D/g, "") ? parseInt(post.read) * 200 : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Field Notes", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      {post.faqs && post.faqs.length > 0 && <FAQSchema faqs={post.faqs} />}
      <ScrollProgress />
      <Header />
      <main className="relative">
        {/* Post header */}
        <section className="relative pt-32 md:pt-40 pb-16 px-6 md:px-16 border-b border-white/5">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-text-dim hover:text-green transition-colors mb-10 group"
            >
              <span className="w-6 h-px bg-text-dim group-hover:bg-green transition-colors" />
              Back to Field Notes
            </Link>

            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green mb-6 flex items-center gap-3">
              <span>{post.tag}</span>
              <span className="text-text-dim/60">·</span>
              <span>{post.date}</span>
              <span className="text-text-dim/60">·</span>
              <span>{post.read}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[1] mb-4">
              {post.title}
            </h1>
            {post.subhead && (
              <p className="text-xl md:text-2xl text-white/75 leading-tight mb-8 font-medium">
                {post.subhead}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-text-dim">
              <span className="w-8 h-8 rounded-full bg-green/15 border border-green/40 flex items-center justify-center font-mono text-[10px] text-green font-bold">
                HZ
              </span>
              <span>By {post.author}</span>
            </div>
          </div>
        </section>

        {/* Post body */}
        <article className="relative py-20 md:py-28 px-6 md:px-16">
          <div className="max-w-3xl mx-auto">{post.body}</div>
        </article>

        {/* Post footer + related */}
        <section className="relative py-20 px-6 md:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-6">
              Keep reading
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-[#080808] border border-white/8 hover:border-green/60 rounded-2xl p-8 transition-colors"
                >
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70 mb-3">
                    {p.tag} · {p.read}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-green transition-colors leading-tight mb-3">
                    {p.title}
                  </h3>
                  <p className="text-text-dim text-sm leading-6">{p.excerpt}</p>
                  <div className="mt-6 font-mono text-[11px] tracking-[0.25em] uppercase text-white/70 group-hover:text-green transition-colors">
                    Read note →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
