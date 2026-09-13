import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Calendar, Clock, Search, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-kit";
import { Button } from "@/components/ui/button";
import { posts, storyImage } from "@/lib/catalog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The Farm Journal & Recipes — JANANI AGRO PRODUCTS" },
      { name: "description", content: "Stories, guides, recipes and agricultural insights from Janani Agro Products." },
      { property: "og:title", content: "The Farm Journal — JANANI" },
    ],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", "Pantry Wisdom", "Organic Farming", "Health & Recipes", "Storage Guides"];

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search]);

  return (
    <>
      <PageHero
        eyebrow="The Harvest Journal"
        title="Field Notes & Mindful Living"
        copy="Exploring the deep connection between sustainable agronomy, wholesome traditional ingredients, and everyday culinary nourishment."
        image={storyImage}
      />

      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Controls */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={activeTag === tag ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles & topics..."
              className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-4 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Featured Post (first post) */}
        {filteredPosts.length > 0 && (() => {
          const featured = filteredPosts[0]!;
          return (
            <div className="mb-14 overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-luxe grid lg:grid-cols-2">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-72 w-full object-cover lg:h-full"
              />
              <div className="flex flex-col justify-between p-8 sm:p-12">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-leaf/15 px-3 py-1 text-xs font-semibold text-brand-leaf">
                    <Sparkles className="size-3" /> Featured Article
                  </span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-semibold leading-tight text-foreground">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {featured.excerpt} Discover how traditional agricultural practices yield greater nutritional density and authentic, unmasked aromas.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {featured.date}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> 5 min read</span>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/blog/$slug" params={{ slug: featured.slug }}>
                      Read Story <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Post Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.slice(1).map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-luxe"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-brand-leaf font-medium">
                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><BookOpen className="size-3" /> 4 min read</span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-brand-leaf transition-colors"
                  >
                    Read full article <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-lg font-semibold">No journal stories found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try searching with a different term.</p>
            <Button onClick={() => setSearch("")} className="mt-4" variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
