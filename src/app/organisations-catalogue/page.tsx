"use client"

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontalIcon, GlobeIcon, InstagramIcon, FacebookIcon, TwitterIcon, UsersIcon, CalendarIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ORG_SAMPLE = [
  {
    id: 1,
    name: "Music Club",
    logo: "/MoT logo.png",
    category: "Cultural",
    induction: true,
    description: "The Music Club is a vibrant community for music lovers, offering opportunities to perform, learn, and collaborate. We host regular jam sessions, workshops, and concerts. Join us to explore your musical talents!",
    people: [
      { name: "Alice", avatar: "", fallback: "A" },
      { name: "Bob", avatar: "", fallback: "B" },
    ],
    deadline: "2024-07-15",
    socials: [
      { type: "instagram", url: "https://instagram.com/musicclub" },
      { type: "twitter", url: "https://twitter.com/musicclub" },
    ],
  },
  {
    id: 2,
    name: "Tech Society",
    logo: "/globe.svg",
    category: "Technical",
    induction: false,
    description: "Tech Society is the hub for all things technology. We organize hackathons, coding competitions, and tech talks. Whether you're a beginner or a pro, there's something for everyone!",
    people: [
      { name: "Charlie", avatar: "", fallback: "C" },
      { name: "Dana", avatar: "", fallback: "D" },
    ],
    deadline: "2024-08-01",
    socials: [
      { type: "facebook", url: "https://facebook.com/techsociety" },
      { type: "twitter", url: "https://twitter.com/techsociety" },
    ],
  },
  {
    id: 3,
    name: "Drama Club",
    logo: "/theater.svg",
    category: "Cultural",
    induction: true,
    description: "Drama Club brings together aspiring actors, directors, and playwrights. We stage plays, conduct acting workshops, and participate in intercollegiate events. Unleash your creativity on stage!",
    people: [
      { name: "Eve", avatar: "", fallback: "E" },
      { name: "Frank", avatar: "", fallback: "F" },
    ],
    deadline: "2024-07-20",
    socials: [
      { type: "instagram", url: "https://instagram.com/dramaclub" },
      { type: "facebook", url: "https://facebook.com/dramaclub" },
    ],
  },
];

const CATEGORIES = ["All", "Cultural", "Technical"];
const INDUCTION_STATUS = ["All", "Open", "Closed"];

function getSocialIcon(type: string) {
  switch (type) {
    case "instagram":
      return <InstagramIcon className="size-7" />;
    case "facebook":
      return <FacebookIcon className="size-7" />;
    case "twitter":
      return <TwitterIcon className="size-7" />;
    default:
      return <GlobeIcon className="size-7" />;
  }
}

export default function OrganisationsCataloguePage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [induction, setInduction] = useState("All");
  const [searchDropdown, setSearchDropdown] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = ORG_SAMPLE.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || org.category === category;
    const matchesInduction =
      induction === "All" ||
      (induction === "Open" && org.induction) ||
      (induction === "Closed" && !org.induction);
    return matchesSearch && matchesCategory && matchesInduction;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Organisations Catalogue</h1>
            <p className="text-muted-foreground text-base">Discover all student organisations, clubs, and societies. Filter by category or induction status, and learn more about each group!</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open filters sidebar">
            <SlidersHorizontalIcon className="size-6" />
          </Button>
        </div>
        <div className="mb-6 flex gap-4 items-center relative">
          <Input
            placeholder="Search organisations..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchDropdown(false), 150)}
            className="max-w-xs"
            autoComplete="off"
          />
          {searchDropdown && filtered.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-popover border rounded-md shadow z-10">
              {filtered.slice(0, 5).map(org => (
                <div
                  key={org.id}
                  className="px-4 py-2 cursor-pointer hover:bg-accent"
                  onMouseDown={() => {
                    setSearch(org.name);
                    setSearchDropdown(false);
                  }}
                >
                  {org.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="min-h-[270px]">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="size-12" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))
            : filtered.map(org => (
                <Dialog key={org.id}>
                  <DialogTrigger asChild>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer min-h-[270px]">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <img src={org.logo} alt={org.name} className="size-12 rounded-full object-cover border" />
                        <div className="flex-1">
                          <CardTitle>{org.name}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{org.category}</Badge>
                            {org.induction && (
                              <Badge variant="default">Inductions Open</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {org.description.length > 140 ? org.description.slice(0, 140) + "..." : org.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="ml-auto">Read More</Button>
                      </CardFooter>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <div className="flex items-center gap-4 mb-2">
                        <img src={org.logo} alt={org.name} className="size-20 rounded-full object-cover border" />
                        <div>
                          <DialogTitle>{org.name}</DialogTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{org.category}</Badge>
                            {org.induction && (
                              <Badge variant="default">Inductions Open</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <UsersIcon className="size-6 text-muted-foreground" />
                        <span className="text-base">{org.people.map(p => p.name).join(", ")}</span>
                      </div>
                      {org.induction && (
                        <div className="flex items-center gap-4 mb-2">
                          <CalendarIcon className="size-6 text-muted-foreground" />
                          <span className="text-base">Induction Deadline: {org.deadline}</span>
                        </div>
                      )}
                      <div className="flex gap-3 mb-4">
                        {org.socials.map(s => (
                          <a key={s.type} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            {getSocialIcon(s.type)}
                          </a>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <DialogDescription>
                        <div className="mt-2 text-lg text-foreground">
                          {org.description}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              ))}
        </div>
      </div>
      {/* Right Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-80 px-6 py-6">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your search by category or induction status.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue>{category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Induction Status</label>
              <Select value={induction} onValueChange={setInduction}>
                <SelectTrigger>
                  <SelectValue>{induction}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INDUCTION_STATUS.map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-8 text-xs text-muted-foreground">
              <p>Tip: Use the search bar to quickly find an organisation by name.</p>
              <p className="mt-2">You can also filter by category or induction status to narrow down your results.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 