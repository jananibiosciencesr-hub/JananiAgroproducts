import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, CheckCircle2, ChevronRight, Share2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { posts, storyImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const p = posts.find((x) => x.slug === params.slug);
    const title = p ? `${p.title} — JANANI AGRO PRODUCTS` : "Journal — JANANI";
    return {
      meta: [
        { title },
        { name: "description", content: p?.excerpt ?? "Journal story from Janani Agro Products." },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const fallbackPost = posts[0]!;
  const post = posts.find((p) => p.slug === slug) ?? fallbackPost;
  const relatedPosts = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    } else {
      toast.success("Article link ready to share!");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3" />
        <Link to="/blog" className="hover:text-primary">Journal</Link>
        <ChevronRight className="size-3" />
        <span className="truncate max-w-xs text-foreground font-medium">{post.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-leaf">
          <span className="rounded-full bg-accent px-3 py-1 text-primary">Farm & Pantry Wisdom</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3.5" /> {post.date}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="size-3.5" /> 5 min read
          </span>
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-6 text-base leading-8 text-muted-foreground font-light italic">
          "{post.excerpt}"
        </p>

        <div className="mt-8 flex items-center justify-between border-y border-border py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">
              <User className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">Janani Agronomy Team</p>
              <p className="text-[11px] text-muted-foreground">Organic Cultivation Desk</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
            <Share2 className="size-3.5" /> Share
          </Button>
        </div>
      </header>

      {/* Hero Image */}
      <div className="mt-10 overflow-hidden rounded-[2.5rem] shadow-luxe">
        <img
          src={post.image}
          alt={post.title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      {/* Article Body Content */}
      <div className="mt-12 space-y-7 text-sm leading-8 text-foreground/85 sm:text-base">
        <p>
          At <strong>JANANI AGRO PRODUCTS</strong>, our relationship with crops starts deep in the soil. Unlike intensive modern agricultural models that prioritize excessive yield at the cost of nutrient degradation, sustainable agro-ecological practices preserve the complex microbiome of agricultural lands.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          1. The Essence of Minimal Processing
        </h2>
        <p>
          When grains and spices are subjected to high-friction industrial polishers and excessive heat milling, they lose critical volatile essential oils, dietary fibers, and natural vitamin complexes. Slow cold-milling and artisanal stone grinding keep temperatures below 40°C, ensuring that the natural aroma and live enzymes remain intact.
        </p>

        <div className="my-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Sparkles className="size-6 text-brand-gold shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-primary">Did You Know?</h4>
              <p className="mt-1 text-xs sm:text-sm text-foreground/80 leading-7">
                Native Indian unpolished pulses retain their mineral-rich outer bran, which provides higher bioavailability of iron, zinc, and plant-based proteins compared to chemically polished alternatives.
              </p>
            </div>
          </div>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          2. Traceable Origins & Soil Health
        </h2>
        <p>
          Each package produced in our Lodhika GIDC facility originates from carefully mapped partner clusters. By committing to fair farm-gate pricing, our farmers invest in organic compost, vermicompost enrichment, and seasonal crop rotation cycles like leguminous nitrogen-fixing pulses.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mt-6">
          {[
            "Pesticide-free certified cultivation",
            "Non-GMO native indigenous seeds",
            "Moisture controlled food-safe packing",
            "Direct benefits to agrarian families",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-brand-leaf shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          3. Bringing Purity to Everyday Kitchens
        </h2>
        <p>
          Making the transition to organic living doesn't require overwhelming culinary overhauls. Simply replacing everyday staples — such as switching to cold-pressed cooking oils, unadulterated whole turmeric, and traditional grains like Khapli wheat or millets — creates an immediate positive impact on digestive wellness and long-term vitality.
        </p>
      </div>

      {/* CTA Box */}
      <div className="mt-16 rounded-3xl bg-forest p-8 text-center text-primary-foreground sm:p-12">
        <h3 className="font-display text-2xl font-semibold sm:text-3xl">
          Experience the Difference of True Organic Harvest
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-primary-foreground/75 leading-6">
          Explore our collection of 100% farm-traceable grains, spices, oils, and pulses delivered directly to your doorstep.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold">
            <Link to="/products">Shop Pure Essentials</Link>
          </Button>
          <Button asChild variant="glass">
            <Link to="/blog">More Journal Stories</Link>
          </Button>
        </div>
      </div>

      {/* Related Posts */}
      <section className="mt-20 border-t border-border pt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Related Stories</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/blog">View all <ArrowRight className="size-3.5 ml-1" /></Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {relatedPosts.map((r) => (
            <article key={r.slug} className="group rounded-2xl border border-border bg-card p-4 shadow-soft">
              <img
                src={r.image}
                alt={r.title}
                className="aspect-[16/10] w-full rounded-xl object-cover"
              />
              <p className="mt-3 text-[11px] text-brand-leaf font-medium">{r.date}</p>
              <h3 className="mt-1 font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {r.title}
              </h3>
              <Button asChild variant="link" className="mt-2 px-0 text-xs font-bold">
                <Link to="/blog/$slug" params={{ slug: r.slug }}>
                  Read story →
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
