export interface UserData {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'subadmin'
    profilePicture?: string;
    phone?: string;
}
