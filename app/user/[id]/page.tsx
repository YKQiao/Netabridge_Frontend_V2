"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { BrandedLoading } from "@/components/ui/BrandedLoading";
import {
  Package,
  CalendarBlank,
  User,
  ShoppingCart,
  CurrencyDollar,
  Buildings,
  Briefcase,
  Envelope,
  Phone,
} from "@phosphor-icons/react";
import { LogoWithName } from "@/components/ui/Logo";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";

interface PublicProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  company_name?: string | null;
  job_title?: string | null;
  description?: string | null;
  summary?: string | null;
  phone?: string | null;
  image?: string | null;
  allow_public_profile: boolean;
  is_active: boolean;
  created_at: string;
}

interface PublicResource {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number | null;
  currency: string;
  is_public: boolean;
}

interface PublicBuyPost {
  id: string;
  title: string;
  description: string;
  budget_range: string | null;
  deadline: string | null;
  status: string;
}

function ResourceCardReadOnly({ resource }: { resource: PublicResource }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900">{resource.name}</h3>
      </div>
      <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{resource.description || "No description provided"}</p>
      <div className="flex gap-4 text-[12px] text-gray-500">
        <span>Qty: {resource.quantity}</span>
        {resource.price != null && (
          <span className="text-emerald-600 font-medium">
            {resource.currency || "$"}{resource.price}
          </span>
        )}
      </div>
    </div>
  );
}

function BuyPostCardReadOnly({ post }: { post: PublicBuyPost }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={20} className="text-purple-600" />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900">{post.title}</h3>
      </div>
      <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{post.description}</p>
      <div className="flex flex-wrap gap-3 text-[12px] text-gray-500">
        {post.budget_range && (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CurrencyDollar size={13} />{post.budget_range}
          </span>
        )}
        {post.deadline && (
          <span className="flex items-center gap-1">
            <CalendarBlank size={13} />Due: {new Date(post.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [resources, setResources] = useState<PublicResource[]>([]);
  const [buyPosts, setBuyPosts] = useState<PublicBuyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      // Step 1: Fetch profile from the correct endpoint
      let profileData: PublicProfile | null = null;
      try {
        profileData = await apiClient.get<PublicProfile>(`/api/v1/users/profile/${userId}`);
        setProfile(profileData);
      } catch {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Step 2: Fetch public resources and buy posts in parallel
      const [resourcesResult, buyPostsResult] = await Promise.allSettled([
        profileData?.email
          ? apiClient.get<PublicResource[]>(`/api/v1/resources/public/${encodeURIComponent(profileData.email)}`)
          : Promise.resolve([]),
        apiClient.get<PublicBuyPost[]>(`/api/v1/buy-posts/public/${userId}`),
      ]);

      if (resourcesResult.status === "fulfilled") {
        setResources(Array.isArray(resourcesResult.value) ? resourcesResult.value : []);
      }
      if (buyPostsResult.status === "fulfilled") {
        setBuyPosts(Array.isArray(buyPostsResult.value) ? buyPostsResult.value : []);
      }

      setLoading(false);
    };

    fetchAll();
  }, [userId]);

  if (loading) return <BrandedLoading />;

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] p-6 text-center">
        <User size={64} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-500 max-w-md mb-6">This user profile could not be found or is not publicly available.</p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-[#4A7DC4] text-white rounded-md font-medium hover:bg-[#3A5A8C]">
          Return Home
        </button>
      </div>
    );
  }

  const initials = (profile.display_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <header
        className="h-14 flex items-center px-4 md:px-6 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #5B8FD4 0%, #4A7DC4 50%, #3D6BA8 100%)" }}
      >
        <LogoWithName variant="white" size="md" />
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <CaretLeft size={16} weight="bold" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 pt-8 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.display_name || "User"}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-white shadow"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A7DC4] to-[#3A5A8C] flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0 shadow">
                  {initials}
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{profile.display_name || "Unknown User"}</h1>

                {/* Job title + company */}
                {(profile.job_title || profile.company_name) && (
                  <div className="mt-1.5 flex flex-col md:flex-row items-center md:items-center gap-1 text-[14px]">
                    {profile.job_title && (
                      <span className="flex items-center gap-1 font-medium text-[#4A7DC4]">
                        <Briefcase size={14} />
                        {profile.job_title}
                      </span>
                    )}
                    {profile.job_title && profile.company_name && (
                      <span className="text-gray-300 hidden md:inline">·</span>
                    )}
                    {profile.company_name && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Buildings size={14} />
                        {profile.company_name}
                      </span>
                    )}
                  </div>
                )}

                {/* Contact info */}
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-[12px] text-gray-500">
                  {profile.email && (
                    <span className="flex items-center gap-1">
                      <Envelope size={13} />
                      {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} />
                      {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={13} />
                    Joined {new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                  </span>
                </div>

                {/* Description */}
                {profile.description && (
                  <p className="mt-4 text-[13px] text-gray-600 leading-relaxed max-w-prose">{profile.description}</p>
                )}

                {/* Summary */}
                {profile.summary && (
                  <p className="mt-2 text-[13px] text-gray-500 italic leading-relaxed max-w-prose">{profile.summary}</p>
                )}
              </div>
            </div>
          </div>

          {/* Offers Section */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-[#4A7DC4]" />
              Offers
              <span className="ml-1 px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-600 rounded-full">
                {resources.length}
              </span>
            </h2>
            {resources.length === 0 ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-lg py-10 text-center text-[13px] text-gray-400">
                No active public offers at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((r) => (
                  <ResourceCardReadOnly key={r.id} resource={r} />
                ))}
              </div>
            )}
          </div>

          {/* Requests Section */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-[#4A7DC4]" />
              Requests
              <span className="ml-1 px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-600 rounded-full">
                {buyPosts.length}
              </span>
            </h2>
            {buyPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-lg py-10 text-center text-[13px] text-gray-400">
                No open public requests at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyPosts.map((p) => (
                  <BuyPostCardReadOnly key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
