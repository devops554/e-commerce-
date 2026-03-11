import {
    LayoutDashboard,
    Package,
    Warehouse as WarehouseIcon,
    History,
    Settings,
    Bike,
    Bell,
} from 'lucide-react'

export const managerNavigation = [
    {
        title: 'Dashboard',
        href: '/manager',
        icon: LayoutDashboard,
    },
    {
        title: 'Inventory',
        href: '/manager/inventory',
        icon: Package,
    },
    {
        title: 'My Orders',
        href: '/manager/orders',
        icon: WarehouseIcon,
    },
    {
        title: 'Stock History',
        href: '/manager/history',
        icon: History,
    },
    {
        title: 'Delivery Fleet',
        href: '/manager/delivery-partners',
        icon: Bike,
    },
    {
        title: "Notifications",
        href: "/manager/notifications",
        icon: Bell,
    },
    {
        title: 'Settings',
        href: '/manager/settings',
        icon: Settings,
    },
]
