const KEY = "bincycle:booking:draft";

// Shape of the in-progress booking draft persisted to localStorage while the
// user works through the booking flow. Extra/unknown fields are tolerated
// since the draft can evolve across booking-flow steps.
export interface BookingDraft {
    addressId?: string;
    slotId?: string;
    date?: string;
    notes?: string;
    images?: string[];
    couponCode?: string | null;
    [key: string]: unknown;
}

export const loadDraft = (): BookingDraft | null => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        return JSON.parse(raw) as BookingDraft;
    } catch {
        return null;
    }
};

export const saveDraft = (draft: BookingDraft): boolean => {
    try {
        localStorage.setItem(KEY, JSON.stringify(draft));
        return true;
    } catch (e) {
        // Most likely quota exceeded due to a large image dataURL.
        console.warn(
            "Could not persist booking draft:",
            e instanceof Error ? e.message : e
        );
        return false;
    }
};

export const clearDraft = (): void => {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
};

export const fileToDataUrl = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
