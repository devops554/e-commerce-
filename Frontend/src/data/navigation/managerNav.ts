import {
    LayoutDashboard,
    Package,
    Warehouse as WarehouseIcon,
    History,
    Settings,
    Bike,
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
        title: 'Fulfillment',
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
        title: 'Settings',
        href: '/manager/settings',
        icon: Settings,
    },
]
