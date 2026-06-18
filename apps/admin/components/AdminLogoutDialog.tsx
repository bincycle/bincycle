"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { clearAdminLocal } from "@workspace/data/adminMock";

interface AdminLogoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AdminLogoutDialog = ({
    open,
    onOpenChange,
}: AdminLogoutDialogProps) => {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    const handle = () => {
        setPending(true);
        setTimeout(() => {
            clearAdminLocal();
            setPending(false);
            onOpenChange(false);
            toast.success("Signed out of the admin console.");
            router.push("/admin/login");
        }, 450);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-testid="admin-logout-dialog"
                className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-6"
            >
                <DialogHeader className="text-left space-y-1.5">
                    <p className="font-mono-label text-xs text-[#596155]">
                        Sign out
                    </p>
                    <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                        Sign out of the console?
                    </DialogTitle>
                    <DialogDescription className="text-[#596155]">
                        Your local admin session will end. Demo data
                        (executives, customers, pickups) is preserved on this
                        device.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 mt-5">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={pending}
                        data-testid="admin-logout-cancel"
                        className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handle}
                        disabled={pending}
                        data-testid="admin-logout-confirm"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-[#C45B38] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors disabled:opacity-60"
                    >
                        {pending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Signing out...
                            </>
                        ) : (
                            <>
                                <LogOut size={14} />
                                Sign out
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminLogoutDialog;
