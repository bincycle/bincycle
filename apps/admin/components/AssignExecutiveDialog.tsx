"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@workspace/ui/components/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";
import { assignExecutiveToPickup, getAdminProfile } from "@workspace/data/adminMock";

export interface Executive {
    id: string;
    name: string;
    empId: string;
    zone: string;
    status: "active" | "inactive" | string;
}

export interface Pickup {
    id: string;
    executiveId?: string;
    [key: string]: unknown;
}

export interface AssignExecutiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pickup: Pickup | null | undefined;
    executives: Executive[];
    onAssigned?: () => void;
}

export const AssignExecutiveDialog = ({
    open,
    onOpenChange,
    pickup,
    executives,
    onAssigned,
}: AssignExecutiveDialogProps) => {
    const [selected, setSelected] = useState<string>(pickup?.executiveId || "");
    const [pending, setPending] = useState(false);

    useEffect(() => {
        setSelected(pickup?.executiveId || "");
    }, [pickup?.executiveId, open]);

    const submit = () => {
        if (!selected) {
            toast.error("Choose an executive to continue.");
            return;
        }
        if (!pickup) return;

        setPending(true);
        setTimeout(() => {
            const actor = getAdminProfile().name || "Admin";
            assignExecutiveToPickup(pickup.id, selected, actor);
            setPending(false);
            toast.success("Executive updated.");
            onOpenChange(false);
            onAssigned?.();
        }, 400);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-testid="assign-exec-dialog"
                className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-6"
            >
                <DialogHeader className="text-left space-y-1.5">
                    <p className="font-mono-label text-xs text-[#596155]">
                        Booking {pickup?.id}
                    </p>
                    <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                        {pickup?.executiveId
                            ? "Reassign executive"
                            : "Assign executive"}
                    </DialogTitle>
                    <DialogDescription className="text-[#596155]">
                        Pick a partner from your active roster. Reassignments
                        are logged.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-3 space-y-2">
                    <Label className="font-mono-label text-[10px] text-[#596155]">
                        Executive
                    </Label>
                    <Select value={selected} onValueChange={setSelected}>
                        <SelectTrigger
                            data-testid="assign-exec-select"
                            className="h-11 rounded-sm border-[#D1CDBC] bg-white focus:ring-[#284226]"
                        >
                            <SelectValue placeholder="Select an executive" />
                        </SelectTrigger>
                        <SelectContent>
                            {executives
                                .filter((e) => e.status === "active")
                                .map((e) => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.name} · {e.empId} · {e.zone}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="flex-row gap-2 mt-5">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={pending}
                        data-testid="assign-cancel"
                        className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={pending}
                        data-testid="assign-confirm"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-[#171A15] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#C45B38] transition-colors disabled:opacity-60"
                    >
                        {pending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <UserCog size={14} />
                                Save assignment
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignExecutiveDialog;
