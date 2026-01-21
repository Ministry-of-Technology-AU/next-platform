'use client';

import { useEffect } from 'react';

export function DismissNewToolAlert({ storageKey }: { storageKey: string }) {
    useEffect(() => {
        localStorage.setItem(storageKey, 'true');
    }, [storageKey]);

    return null;
}
