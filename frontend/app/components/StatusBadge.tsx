import React from "react";

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export function getStatusTheme(status: string) {
  const normalized = status.toUpperCase().replace(/_/g, " ").trim();

  switch (normalized) {
    case "PAID":
    case "ACCEPTED":
    case "APPROVED":
    case "COMPLETED":
    case "ACTIVE":
      return "bg-[#ECFDF5] text-[#067647] border-[#ABEFC6] shadow-[0_2px_8px_rgba(6,118,71,0.12)]";

    case "SENT":
    case "IN PROGRESS":
    case "ISSUED":
    case "READ":
      return "bg-[#EAF2FF] text-[#2563EB] border-[#B2DDFF] shadow-[0_2px_8px_rgba(37,99,235,0.12)]";

    case "PARTIAL":
    case "PARTIALLY PAID":
    case "PENDING":
    case "UPCOMING":
    case "UNREAD":
    case "ON HOLD":
      return "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89] shadow-[0_2px_8px_rgba(181,71,8,0.12)]";

    case "OVERDUE":
    case "REJECTED":
    case "CANCELLED":
    case "DELAYED":
    case "EXPIRED":
    case "INACTIVE":
      return "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] shadow-[0_2px_8px_rgba(180,35,24,0.12)]";

    case "DRAFT":
    case "ARCHIVED":
    case "CLOSED":
    case "PLANNING":
    case "HANDOVER":
    default:
      return "bg-[#F8FAFC] text-[#475467] border-[#E2E8F0]";
  }
}

export function getStatusDotColor(status: string) {
  const normalized = status.toUpperCase().replace(/_/g, " ").trim();

  switch (normalized) {
    case "PAID":
    case "ACCEPTED":
    case "APPROVED":
    case "COMPLETED":
    case "ACTIVE":
      return "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]";

    case "SENT":
    case "IN PROGRESS":
    case "ISSUED":
    case "READ":
      return "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse";

    case "PARTIAL":
    case "PARTIALLY PAID":
    case "PENDING":
    case "UPCOMING":
    case "UNREAD":
    case "ON HOLD":
      return "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]";

    case "OVERDUE":
    case "REJECTED":
    case "CANCELLED":
    case "DELAYED":
    case "EXPIRED":
    case "INACTIVE":
      return "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]";

    default:
      return "bg-slate-400";
  }
}

export function formatStatusText(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const theme = getStatusTheme(status);
  const dotColor = getStatusDotColor(status);
  const displayText = label || formatStatusText(status);

  return (
    <span
      className={`status-badge inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${theme} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
      {displayText}
    </span>
  );
}

