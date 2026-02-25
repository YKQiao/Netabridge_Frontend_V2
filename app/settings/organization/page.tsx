"use client";

import { useState } from "react";
import {
  Buildings,
  PencilSimple,
  Check,
  X,
  UserPlus,
  Crown,
  ShieldCheck,
  User,
  EnvelopeSimple,
  Clock,
  Trash,
  DotsThree,
  Globe,
  UsersThree,
  Factory,
} from "@phosphor-icons/react";

// =============================================================================
// Types
// =============================================================================

interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  website: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  isCurrentUser?: boolean;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: "admin" | "member";
  sentAt: string;
  expiresAt: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_ORGANIZATION: Organization = {
  id: "org-1",
  name: "Slava Solutions",
  industry: "Technology",
  size: "11-50",
  website: "https://slavasolutions.com",
};

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-1",
    name: "Alex Petrov",
    email: "alex@slavasolutions.com",
    role: "owner",
    isCurrentUser: true,
    joinedAt: "Jan 2024",
  },
  {
    id: "user-2",
    name: "Maria Chen",
    email: "maria@slavasolutions.com",
    role: "admin",
    joinedAt: "Feb 2024",
  },
  {
    id: "user-3",
    name: "David Kim",
    email: "david@slavasolutions.com",
    role: "admin",
    joinedAt: "Mar 2024",
  },
  {
    id: "user-4",
    name: "Sarah Johnson",
    email: "sarah@slavasolutions.com",
    role: "member",
    joinedAt: "Apr 2024",
  },
];

const MOCK_PENDING_INVITES: PendingInvite[] = [
  {
    id: "invite-1",
    email: "james@example.com",
    role: "member",
    sentAt: "2 days ago",
    expiresAt: "5 days",
  },
  {
    id: "invite-2",
    email: "lisa.wong@company.org",
    role: "admin",
    sentAt: "1 week ago",
    expiresAt: "Expires tomorrow",
  },
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Other",
];

const SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

// =============================================================================
// Components
// =============================================================================

function RoleBadge({ role }: { role: "owner" | "admin" | "member" }) {
  const config = {
    owner: {
      icon: Crown,
      label: "Owner",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      iconColor: "text-amber-500",
    },
    admin: {
      icon: ShieldCheck,
      label: "Admin",
      bgColor: "bg-[#EEF4FB]",
      textColor: "text-[#4A7DC4]",
      iconColor: "text-[#4A7DC4]",
    },
    member: {
      icon: User,
      label: "Member",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      iconColor: "text-gray-400",
    },
  };

  const { icon: Icon, label, bgColor, textColor, iconColor } = config[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${bgColor} ${textColor} text-[11px] font-medium`}
    >
      <Icon size={12} weight="fill" className={iconColor} />
      {label}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; weight?: string; className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={18} weight="regular" className="text-gray-400" />
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function OrganizationInfoCard({
  organization,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  editedOrg,
  setEditedOrg,
}: {
  organization: Organization;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editedOrg: Organization;
  setEditedOrg: (org: Organization) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Organization Information"
        icon={Buildings}
        action={
          !isEditing ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:text-[#4A7DC4] hover:bg-gray-50 rounded transition-colors"
            >
              <PencilSimple size={14} weight="bold" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                <X size={14} weight="bold" />
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-white bg-[#4A7DC4] hover:bg-[#3A5A8C] rounded transition-colors"
              >
                <Check size={14} weight="bold" />
                Save
              </button>
            </div>
          )
        }
      />
      <div className="p-5">
        {!isEditing ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField label="Organization Name">
                <p className="text-[14px] text-gray-900 font-medium">
                  {organization.name}
                </p>
              </FormField>
              <FormField label="Industry">
                <div className="flex items-center gap-2">
                  <Factory size={16} className="text-gray-400" />
                  <p className="text-[14px] text-gray-700">{organization.industry}</p>
                </div>
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField label="Company Size">
                <div className="flex items-center gap-2">
                  <UsersThree size={16} className="text-gray-400" />
                  <p className="text-[14px] text-gray-700">
                    {organization.size} employees
                  </p>
                </div>
              </FormField>
              <FormField label="Website">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-400" />
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-[#4A7DC4] hover:underline"
                  >
                    {organization.website.replace("https://", "")}
                  </a>
                </div>
              </FormField>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField label="Organization Name">
                <input
                  type="text"
                  value={editedOrg.name}
                  onChange={(e) =>
                    setEditedOrg({ ...editedOrg, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
                />
              </FormField>
              <FormField label="Industry">
                <select
                  value={editedOrg.industry}
                  onChange={(e) =>
                    setEditedOrg({ ...editedOrg, industry: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20 bg-white"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField label="Company Size">
                <select
                  value={editedOrg.size}
                  onChange={(e) =>
                    setEditedOrg({ ...editedOrg, size: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20 bg-white"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} employees
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Website">
                <input
                  type="url"
                  value={editedOrg.website}
                  onChange={(e) =>
                    setEditedOrg({ ...editedOrg, website: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
                  placeholder="https://example.com"
                />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EEF4FB] text-[#4A7DC4] flex items-center justify-center text-[13px] font-semibold">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-900">
                {member.name}
              </span>
              {member.isCurrentUser && (
                <span className="text-[10px] text-gray-400 font-medium">(You)</span>
              )}
            </div>
            <span className="text-[12px] text-gray-500">{member.email}</span>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <RoleBadge role={member.role} />
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[12px] text-gray-400">Joined {member.joinedAt}</span>
      </td>
      <td className="px-5 py-3.5 text-right">
        {!member.isCurrentUser && member.role !== "owner" && (
          <div className="relative inline-block">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <DotsThree size={18} weight="bold" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full px-3 py-2 text-left text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                    Change role
                  </button>
                  <button className="w-full px-3 py-2 text-left text-[12px] text-red-600 hover:bg-red-50 transition-colors">
                    Remove member
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function TeamMembersCard({
  members,
  onInvite,
}: {
  members: TeamMember[];
  onInvite: () => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Team Members"
        icon={UsersThree}
        action={
          <button
            onClick={onInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#4A7DC4] hover:bg-[#3A5A8C] rounded transition-colors"
          >
            <UserPlus size={14} weight="bold" />
            Invite Member
          </button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Member
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Role
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Joined
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <TeamMemberRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-[12px] text-gray-500">
          {members.length} team member{members.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Card>
  );
}

function PendingInviteRow({
  invite,
  onResend,
  onCancel,
}: {
  invite: PendingInvite;
  onResend: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
          <EnvelopeSimple size={16} weight="regular" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-900">
              {invite.email}
            </span>
            <RoleBadge role={invite.role} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock size={12} className="text-gray-400" />
            <span className="text-[11px] text-gray-400">
              Sent {invite.sentAt} &middot; {invite.expiresAt}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onResend}
          className="px-2.5 py-1 text-[11px] font-medium text-[#4A7DC4] hover:bg-[#EEF4FB] rounded transition-colors"
        >
          Resend
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash size={14} weight="regular" />
        </button>
      </div>
    </div>
  );
}

function PendingInvitesCard({
  invites,
  onResend,
  onCancel,
}: {
  invites: PendingInvite[];
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Pending Invitations" icon={EnvelopeSimple} />
      <div className="px-5 py-2">
        {invites.map((invite) => (
          <PendingInviteRow
            key={invite.id}
            invite={invite}
            onResend={() => onResend(invite.id)}
            onCancel={() => onCancel(invite.id)}
          />
        ))}
      </div>
    </Card>
  );
}

function InviteMemberModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - would send invite here
    console.log("Inviting:", email, role);
    onClose();
    setEmail("");
    setRole("member");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-md shadow-xl w-full max-w-md animate-scale-fade"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={18} weight="regular" className="text-[#4A7DC4]" />
              <h3 className="text-[15px] font-semibold text-gray-900">
                Invite Team Member
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              <FormField label="Email Address">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-[14px] focus:outline-none focus:border-[#4A7DC4] focus:ring-1 focus:ring-[#4A7DC4]/20"
                  required
                />
              </FormField>

              <FormField label="Role">
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={role === "member"}
                      onChange={() => setRole("member")}
                      className="w-4 h-4 text-[#4A7DC4] focus:ring-[#4A7DC4]"
                    />
                    <span className="text-[13px] text-gray-700">Member</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                      className="w-4 h-4 text-[#4A7DC4] focus:ring-[#4A7DC4]"
                    />
                    <span className="text-[13px] text-gray-700">Admin</span>
                  </label>
                </div>
              </FormField>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-[12px] text-gray-500">
                  {role === "admin"
                    ? "Admins can manage team members and organization settings."
                    : "Members can access all features but cannot manage organization settings."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#4A7DC4] hover:bg-[#3A5A8C] rounded transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization>(MOCK_ORGANIZATION);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(MOCK_PENDING_INVITES);

  const [isEditing, setIsEditing] = useState(false);
  const [editedOrg, setEditedOrg] = useState<Organization>(organization);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleSave = () => {
    setOrganization(editedOrg);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedOrg(organization);
    setIsEditing(false);
  };

  const handleResendInvite = (id: string) => {
    console.log("Resending invite:", id);
    // Placeholder - would resend invite here
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Organization</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Manage your organization settings and team members
        </p>
      </div>

      {/* Organization Info */}
      <OrganizationInfoCard
        organization={organization}
        isEditing={isEditing}
        onEdit={() => {
          setEditedOrg(organization);
          setIsEditing(true);
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        editedOrg={editedOrg}
        setEditedOrg={setEditedOrg}
      />

      {/* Team Members */}
      <TeamMembersCard
        members={teamMembers}
        onInvite={() => setShowInviteModal(true)}
      />

      {/* Pending Invites */}
      <PendingInvitesCard
        invites={pendingInvites}
        onResend={handleResendInvite}
        onCancel={handleCancelInvite}
      />

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
