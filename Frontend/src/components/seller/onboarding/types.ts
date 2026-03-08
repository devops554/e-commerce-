export interface SPOCDetails {
    name: string;
    email: string;
    designation: string;
}

export interface DocumentPaths {
    aadhar: string;
    pan: string;
    license: string;
    passbook: string;
    digitalSignature: string;
}

export interface BankDetails {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
}

export interface PickupAddress {
    addressLine: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
}

export interface SellerFormData {
    name: string;
    email: string;
    phone: string;
    storeName: string;
    storeDescription: string;
    businessType: string;
    panNumber: string;
    aadharNumber: string;
    gstNumber: string;
    productTypes: string[];
    productCategories: string[];
    topCategories: string[];
    retailChannels: string[];
    referenceLinks: string[];
    monthlySales: string;
    socialChannels: string[];
    socialMediaLinks: string[];
    userCounts: string[];
    spocDetails: SPOCDetails;
    documentPaths: DocumentPaths;
    bankDetails: BankDetails;
    pickupAddress: PickupAddress;
}

export interface StepProps {
    formData: SellerFormData;
    updateFormData: (field: keyof SellerFormData, value: any) => void;
    updateNestedData: (section: 'bankDetails' | 'pickupAddress' | 'spocDetails' | 'documentPaths', field: string, value: string) => void;
}
