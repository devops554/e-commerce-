import {
    LayoutDashboard,
    Package,
    Warehouse as WarehouseIcon,
    History,
    Settings,
    Bike,
    Bell,
    ClipboardList,
    BarChart3,
    Tag,
    UserCircle,
} from 'lucide-react'

export const managerNavigation = [
    {
        title: 'Dashboard',
        href: '/manager',
        icon: LayoutDashboard,
    },
    {
        title: 'Inventory',
        icon: Package,
        items: [
            {
                title: 'Products',
                icon: ClipboardList,
                href: '/manager/inventory',
            },
            {
                title: 'Stock History',
                icon: History,
                href: '/manager/stock-history',
            },
        ],
    },
    {
        title: 'My Orders',
        icon: WarehouseIcon,
        items: [
            {
                title: 'Orders',
                icon: ClipboardList,
                href: '/manager/orders',
            },
            {
                title: 'Analytics',
                icon: BarChart3,
                href: '/manager/orders/analysis',
            },
            {
                title: 'Order History',
                icon: History,
                href: '/manager/orders/history',
            },

        ],
    },
    {
        title: 'Return Orders',
        href: '/manager/returns',
        icon: Tag,
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
        title: 'Profile',
        href: '/manager/profile',
        icon: UserCircle,
    },
    {
        title: 'Settings',
        href: '/manager/settings',
        icon: Settings,
    },
]
