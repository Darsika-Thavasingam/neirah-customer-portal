import React from "react";

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export function getStatusTheme(status: string) {
  const normalized = status.toUpperCase().replace(/_/g, " ");

  switch (normalized) {
    case "PAID":
    case "ACCEPTED":
    case "APPROVED":
    case "COMPLETED":
    case "ACTIVE":
      return "bg-[#ECFDF5] text-[#067647] border-[#ABEFC6]";

    case "SENT":
    case "IN PROGRESS":
    case "ISSUED":
    case "READ":
      return "bg-[#EAF2FF] text-[#2563EB] border-[#B2DDFF]";

    case "PARTIAL":
    case "PARTIALLY PAID":
    case "PENDING":
    case "UPCOMING":
    case "UNREAD":
      return "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]";

    case "OVERDUE":
    case "REJECTED":
    case "CANCELLED":
    case "DELAYED":
    case "EXPIRED":
      return "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]";

    case "DRAFT":
    case "ARCHIVED":
    default:
      return "bg-[#F8FAFC] text-[#475467] border-[#E2E8F0]";
  }
}

export function formatStatusText(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const theme = getStatusTheme(status);
  const displayText = label || formatStatusText(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${theme} ${className}`}
    >
      {displayText}
    </span>
  );
}
