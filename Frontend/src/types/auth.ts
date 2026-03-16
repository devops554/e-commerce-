import { UserRole } from "@/services/user.service";

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    profilePicture?: string;
    phone?: string;
}
