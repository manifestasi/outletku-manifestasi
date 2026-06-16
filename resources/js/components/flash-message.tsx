import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
};

/**
 * FlashMessage component — reads flash data from Inertia shared props
 * and displays them as sonner toasts.
 *
 * Include this component inside your layout to automatically show flash messages.
 */
export function FlashMessage() {
    const { flash } = usePage<{ flash: Flash }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
