import React from 'react';
import {
    Truck, RefreshCcw, ShieldCheck, HeadphonesIcon,
    Leaf, Award, BadgePercent,
    Phone, Mail, MapPin, Clock,
    Facebook, Twitter, Instagram, Youtube,
    AppWindow, Play,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const TRUST_ITEMS = [
    { icon: <Truck size={24} />, title: 'Free Delivery', sub: 'On orders above ₹299' },
    { icon: <RefreshCcw size={24} />, title: 'Easy Returns', sub: '7-day hassle-free return' },
    { icon: <ShieldCheck size={24} />, title: '100% Secure', sub: 'Encrypted payments' },
    { icon: <HeadphonesIcon size={24} />, title: '24/7 Support', sub: 'Always here to help' },
];

export const BRAND_BADGES = [
    { icon: <Leaf size={10} />, label: '100% Fresh' },
    { icon: <Award size={10} />, label: 'Top Rated' },
    { icon: <BadgePercent size={10} />, label: 'Best Deals' },
];

export const APP_BUTTONS = [
    { icon: <AppWindow size={17} />, platform: 'App Store', label: 'Download on' },
    { icon: <Play size={17} fill="currentColor" />, platform: 'Google Play', label: 'Get it on' },
];

export const NAV_COLUMNS = [
    {
        title: 'Shop',
        links: [
            { label: 'Fresh Produce', href: '/search?category=fresh-produce' },
            { label: 'Dairy & Eggs', href: '/search?category=dairy-eggs' },
            { label: 'Beverages', href: '/search?category=beverages' },
            { label: 'Snacks & Munchies', href: '/search?category=snacks' },
            { label: 'Household', href: '/search?category=household' },
            { label: 'Personal Care', href: '/search?category=personal-care' },
            { label: 'Baby Care', href: '/search?category=baby-care' },
            { label: 'Pet Supplies', href: '/search?category=pet-supplies' },
            { label: 'Organic & Natural', href: '/search?category=organic' },
        ],
    },
    {
        title: 'Customer Care',
        links: [
            { label: 'Track My Order', href: '/my-orders' },
            { label: 'Cancel Order', href: '/my-orders' },
            { label: 'Return & Refund', href: '/faq' },
            { label: 'Report an Issue', href: 'mailto:care@kiranase.com' },
            { label: 'FAQs', href: '/faq' },
            { label: 'Bulk Orders', href: 'mailto:care@kiranase.com' },
            { label: 'Gift Cards', href: '#' },
            { label: 'Loyalty Points', href: '#' },
            { label: 'Refer & Earn', href: '#' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about-us' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press & Media', href: 'mailto:care@kiranase.com' },
            { label: 'Sustainability', href: '/about-us' },
            { label: 'Investor Relations', href: 'mailto:care@kiranase.com' },
            { label: 'Partner with Us', href: '/partner-with-us' },
            { label: 'Sell on Kiranase', href: '/partner-with-us' },
            { label: 'Blog', href: '/blog' },
            { label: 'Sitemap', href: '/sitemap.xml' },
        ],
    },
];

export const CONTACT_ITEMS = [
    { icon: <Phone size={14} />, label: 'Call Us (9AM–9PM)', value: '+91 9128 801 802', href: 'tel:+919128801802' },
    { icon: <Mail size={14} />, label: 'Email Support', value: 'care@kiranase.com', href: 'mailto:care@kiranase.com' },
];

export const SOCIAL_LINKS = [
    { Icon: Facebook, color: '#1877F2', label: 'Facebook', href: 'https://www.facebook.com/kiranaseindia' },
    { Icon: Twitter, color: '#1DA1F2', label: 'Twitter', href: '#' },
    { Icon: Instagram, color: '#E1306C', label: 'Instagram', href: 'https://www.instagram.com/kiranase.official' },
    { Icon: Youtube, color: '#FF0000', label: 'YouTube', href: '#' },
    { Icon: FaWhatsapp, color: '#25D366', label: 'WhatsApp', href: 'https://wa.me/+919128801802' },
];

export const PAYMENT_METHODS = [
    'Visa', 'Mastercard', 'RuPay', 'UPI',
    'PayTM', 'PhonePe', 'GPay', 'NetBanking', 'EMI', 'COD',
];

export const SECURITY_CERTS = [
    'SSL Secured',
    'PCI DSS',
    'ISO 27001',
];

export const LEGAL_INFO = [
    { label: 'FSSAI: 10020042009495' },
    { label: 'GST: 10AABCB1234M1Z5' },
    { label: 'CIN: U51909BR2021PTC001234' },
];

export const LEGAL_ADDRESS = 'Bivha Technology Pvt. Ltd., Patna, Bihar – 800001';

export const BOTTOM_LINKS = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Use', href: '/terms-of-use' },
    { label: 'Cookie Policy', href: '/privacy-policy' },
    { label: 'Accessibility', href: '/about-us' },
    { label: 'Grievance Officer', href: 'mailto:care@kiranase.com' },
];

export const COPYRIGHT = '© 2026 Kiranase : A  PAMALSE COMPANY — All Rights Reserved.';

export const BRAND = {
    img: '/photo/Kiranase-logo.png',
    tagline: 'Kiranase delivers fresh groceries at prices cheaper than your local bazaar. Order from 7000+ products across 10,000+ pincodes in India.',
    rating: '4.9',
    reviews: '12,400+',
    href: '/',
};
