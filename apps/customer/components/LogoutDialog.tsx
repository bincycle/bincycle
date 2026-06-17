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
import { clearAllUserData } from "@workspace/data/accountStorage";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogoutDialog = ({ open, onOpenChange }: LogoutDialogProps) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = () => {
    setPending(true);
    setTimeout(() => {
      clearAllUserData();
      setPending(false);
      onOpenChange(false);
      toast.success("Signed out. See you again soon.");
      router.push("/login");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="logout-dialog"
        className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-6"
      >
        <DialogHeader className="text-left space-y-1.5">
          <p className="font-mono-label text-xs text-[#596155]">Sign out</p>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
            Sign out of Bincycle?
          </DialogTitle>
          <DialogDescription className="text-[#596155]">
            You&apos;ll be returned to the sign-in screen. Your draft and
            locally saved data on this device will be cleared.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 mt-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            data-testid="logout-cancel-btn"
            disabled={pending}
            className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            data-testid="logout-confirm-btn"
            disabled={pending}
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

export default LogoutDialog;
