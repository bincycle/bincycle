// Shared building blocks for the admin pages: page header, stat card, chips, empty state.
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ADMIN_STATUS } from "@workspace/data/adminMock";

interface AdminPageHeaderProps {
    eyebrow: string;
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export const AdminPageHeader = ({
    eyebrow,
    title,
    description,
    actions,
}: AdminPageHeaderProps) => (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
            <p className="font-mono-label text-xs text-[#596155]">{eyebrow}</p>
            <h1 className="mt-2 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
                {title}
            </h1>
            {description && (
                <p className="mt-2 text-sm text-[#596155] max-w-2xl">
                    {description}
                </p>
            )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
    </header>
);

interface StatCardProps {
    label: string;
    value: string | number;
    suffix?: string;
    accent?: string;
    testid?: string;
}

export const StatCard = ({
    label,
    value,
    suffix,
    accent,
    testid,
}: StatCardProps) => (
    <div
        data-testid={testid}
        className="bg-white p-5 sm:p-6 border border-[#D1CDBC] rounded-sm"
    >
        <p className="font-mono-label text-[10px] text-[#596155]">{label}</p>
        <p
            className={`mt-2 font-display text-3xl sm:text-4xl font-black tracking-tighter ${
                accent || "text-[#121710]"
            }`}
        >
            {value}
            {suffix && (
                <span className="text-sm text-[#596155] font-normal ml-1.5">
                    {suffix}
                </span>
            )}
        </p>
    </div>
);

interface StatusChipProps {
    status: string;
    testid?: string;
}

export const StatusChip = ({ status, testid }: StatusChipProps) => {
    const meta = ADMIN_STATUS[status] || ADMIN_STATUS.scheduled;
    return (
        <span
            data-testid={testid}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-label text-[10px] ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

interface EmptyStateProps {
    title: string;
    body?: string;
    action?: React.ReactNode;
}

export const EmptyState = ({ title, body, action }: EmptyStateProps) => (
    <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center">
        <p className="font-display text-lg font-bold tracking-tight text-[#121710]">
            {title}
        </p>
        {body && (
            <p className="mt-1.5 text-sm text-[#596155] max-w-md mx-auto">
                {body}
            </p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);

interface SectionCardProps {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    testid?: string;
}

export const SectionCard = ({
    title,
    action,
    children,
    testid,
}: SectionCardProps) => (
    <section
        data-testid={testid}
        className="rounded-sm border border-[#D1CDBC] bg-white p-5 sm:p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold tracking-tight text-[#121710]">
                {title}
            </h3>
            {action}
        </div>
        {children}
    </section>
);

interface RowLinkProps {
    to: string;
    children: React.ReactNode;
    testid?: string;
}

export const RowLink = ({ to, children, testid }: RowLinkProps) => (
    <Link
        href={to}
        data-testid={testid}
        className="group flex items-center justify-between gap-4 rounded-sm border border-[#D1CDBC] bg-white p-3.5 hover:-translate-y-0.5 hover:border-[#121710] transition-all"
    >
        <div className="min-w-0 flex-1">{children}</div>
        <ChevronRight
            size={14}
            className="text-[#596155] shrink-0 transition-transform group-hover:translate-x-0.5"
        />
    </Link>
);
