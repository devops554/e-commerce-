
import { Building2, LayoutGrid, LucideIcon, RotateCcw } from "lucide-react";
import { UserRole } from "@/services/user.service";

export interface NavItemType {
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: number;
  items?: {
    title: string;
    href: string;
    icon?: LucideIcon;
  }[];
}

import {
  LayoutDashboard,
  Package,
  Bike,
  Layers,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  Ticket,
  Star,
  Images,
  BarChart3,
  Settings,
  ShieldCheck,
  User,
  Bell,
  Database,
  Cloud,
  PlusCircle,
  List,
  ClipboardList,
  Clock,
  CheckCircle2,
  History,
  Tag,
  PlaySquare,
  FileText,
  PieChart,
  UserCircle,
  Key,
  Globe,
  Store
} from "lucide-react";

export const getAdminNavigation = (user: any): NavItemType[] => [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  // 📦 Product Management
  {
    title: "Product",
    icon: Package,
    items: [
      { title: "All Product", href: "/admin/product", icon: List },
      { title: "Add Product", href: "/admin/product/new", icon: PlusCircle },
      { title: "Product Types", href: "/admin/product/product-type", icon: LayoutGrid },
      { title: "Categories", href: "/admin/product/category/root", icon: Layers },
    ],
  },

  // 🛒 Order Management
  {
    title: "Orders",
    icon: ShoppingCart,
    items: [
      { title: "All Orders", href: "/admin/orders", icon: ClipboardList },
      {
        title: 'Return Orders',
        icon: RotateCcw,
        href: '/admin/orders/return-order',
      },
      {
        title: 'Analytics',
        icon: BarChart3,
        href: '/admin/orders/analysis',
      },
      {
        title: 'Order History',
        icon: History,
        href: '/admin/orders/history',
      },

    ],
  },

  // 👥 Users
  {
    title: "Users",
    icon: Users,
    items: [
      { title: "Customers", href: "/admin/users", icon: User },
      { title: "Sellers", href: "/admin/seller", icon: Store },
      { title: "Managers", href: "/admin/manager", icon: User },
      { title: "Delivery Partners", href: "/admin/delivery-partners", icon: Bike },
      ...(user?.role === UserRole.ADMIN ? [
        { title: "sub-admins", href: "/admin/subadmin", icon: ShieldCheck }
      ] : []),
    ],
  },

  // 🏦 Warehouses
  {
    title: "Warehouses",
    icon: Building2,
    items: [
      { title: "All Warehouses", href: "/admin/warehouses", icon: List },
      { title: "Add Warehouse", href: "/admin/warehouses/add", icon: PlusCircle },


    ],
  },

  // 💰 Finance
  {
    title: "Finance",
    icon: TrendingUp,
    items: [
      { title: "Revenue Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Transactions", href: "/admin/transactions", icon: History },
    ],
  },

  // 🎯 Marketing
  {
    title: "Marketing",
    icon: Ticket,
    items: [
      { title: "Coupons", href: "/admin/coupons", icon: Tag },
      { title: "Banners", href: "/admin/banners", icon: PlaySquare },
    ],
  },

  // ⭐ Reviews
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },

  // 📊 Analytics
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Sales Report", href: "/admin/reports/sales", icon: FileText },
      { title: "Product Performance", href: "/admin/reports/products", icon: PieChart },
    ],
  },

  // 🔔 Notifications
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },

  // ☁ Storage & System
  {
    title: "Storage",
    icon: Database,
    items: [
      { title: "Database Usage", href: "/admin/storage/database", icon: Database },
      { title: "Cloudinary", href: "/admin/storage/cloudinary", icon: Cloud },
    ],
  },

  // ⚙ System Settings
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Profile", href: "/admin/profile", icon: UserCircle },
      { title: "Security & Roles", href: "/admin/roles", icon: Key },
      { title: "Global Settings", href: "/admin/settings", icon: Globe },
    ],
  },
];
