export interface VehicleRead {
    id: number;
    branch_name: string;
    model_name: string;
    category_name: string;
    status_name: string;
    plate_number: string;
    year: number;
    name: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}