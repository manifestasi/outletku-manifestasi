// OutletKu domain types

export type Business = {
    id: string;
    name: string;
    slug: string;
    owner_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    logo: string | null;
    is_active: boolean;
    last_activity_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Outlet = {
    id: string;
    business_id: string;
    name: string;
    address: string | null;
    phone: string | null;
    photo: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users_count?: number;
    users?: import('./auth').User[];
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type FlashMessage = {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
};
