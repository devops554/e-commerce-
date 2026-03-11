import React from 'react';
import {
    Truck, RefreshCcw, ShieldCheck, HeadphonesIcon,
    Leaf, Award, BadgePercent,
    Phone, Mail, MapPin, Clock,
    Facebook, Twitter, Instagram, Youtube,
    AppWindow, Play,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// ─────────────────────────────────────────
// Trust Bar
// ─────────────────────────────────────────
export const TRUST_ITEMS = [
    { icon: <Truck size={24} />, title: 'Free Delivery', sub: 'On orders above ₹299' },
    { icon: <RefreshCcw size={24} />, title: 'Easy Returns', sub: '7-day hassle-free return' },
    { icon: <ShieldCheck size={24} />, title: '100% Secure', sub: 'Encrypted payments' },
    { icon: <HeadphonesIcon size={24} />, title: '24/7 Support', sub: 'Always here to help' },
];

// ─────────────────────────────────────────
// Brand Badges
// ─────────────────────────────────────────
export const BRAND_BADGES = [
    { icon: <Leaf size={10} />, label: '100% Fresh' },
    { icon: <Award size={10} />, label: 'Top Rated' },
    { icon: <BadgePercent size={10} />, label: 'Best Deals' },
];

// ─────────────────────────────────────────
// App Download Buttons
// ─────────────────────────────────────────
export const APP_BUTTONS = [
    { icon: <AppWindow size={17} />, platform: 'App Store', label: 'Download on' },
    { icon: <Play size={17} fill="currentColor" />, platform: 'Google Play', label: 'Get it on' },
];

// ─────────────────────────────────────────
// Nav Link Columns
// ─────────────────────────────────────────
export const NAV_COLUMNS = [
    {
        title: 'Shop',
        links: [
            { label: 'Fresh Produce', href: '#' },
            { label: 'Dairy & Eggs', href: '#' },
            { label: 'Beverages', href: '#' },
            { label: 'Snacks & Munchies', href: '#' },
            { label: 'Household', href: '#' },
            { label: 'Personal Care', href: '#' },
            { label: 'Baby Care', href: '#' },
            { label: 'Pet Supplies', href: '#' },
            { label: 'Organic & Natural', href: '#' },
        ],
    },
    {
        title: 'Customer Care',
        links: [
            { label: 'Track My Order', href: '#' },
            { label: 'Cancel Order', href: '#' },
            { label: 'Return & Refund', href: '#' },
            { label: 'Report an Issue', href: '#' },
            { label: 'FAQs', href: '#' },
            { label: 'Bulk Orders', href: '#' },
            { label: 'Gift Cards', href: '#' },
            { label: 'Loyalty Points', href: '#' },
            { label: 'Refer & Earn', href: '#' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press & Media', href: '#' },
            { label: 'Sustainability', href: '#' },
            { label: 'Investor Relations', href: '#' },
            { label: 'Partner with Us', href: '/partner-with-us' },
            { label: 'Sell on Kiranase', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Sitemap', href: '#' },
        ],
    },
];

// ─────────────────────────────────────────
// Contact Items
// ─────────────────────────────────────────
export const CONTACT_ITEMS = [
    { icon: <Phone size={14} />, label: 'Call Us (9AM–9PM)', value: '+91 8581 901 902', href: 'tel:+918581901902' },
    { icon: <Mail size={14} />, label: 'Email Support', value: 'care@kiranase.com', href: 'mailto:care@kiranase.com' },
    // { icon: <MapPin size={14} />, label: 'Head Office', value: 'Kiranase, Patna, Bihar – 800001', href: '#' },
    // { icon: <Clock size={14} />, label: 'Working Hours', value: 'Mon–Sun, 9AM–9PM', href: '#' },
];

// ─────────────────────────────────────────
// Social Links
// ─────────────────────────────────────────
export const SOCIAL_LINKS = [
    { Icon: Facebook, color: '#1877F2', label: 'Facebook', href: '#' },
    { Icon: Twitter, color: '#1DA1F2', label: 'Twitter', href: '#' },
    { Icon: Instagram, color: '#E1306C', label: 'Instagram', href: '#' },
    { Icon: Youtube, color: '#FF0000', label: 'YouTube', href: '#' },
    { Icon: FaWhatsapp, color: '#25D366', label: 'WhatsApp', href: 'https://wa.me/+918581901902' },
];

// ─────────────────────────────────────────
// Payment Methods
// ─────────────────────────────────────────
export const PAYMENT_METHODS = [
    'Visa', 'Mastercard', 'RuPay', 'UPI',
    'PayTM', 'PhonePe', 'GPay', 'NetBanking', 'EMI', 'COD',
];

// ─────────────────────────────────────────
// Security Certifications
// ─────────────────────────────────────────
export const SECURITY_CERTS = [
    'SSL Secured',
    'PCI DSS',
    'ISO 27001',
];

// ─────────────────────────────────────────
// Legal Info
// ─────────────────────────────────────────
export const LEGAL_INFO = [
    { label: 'FSSAI: 10020042009495' },
    { label: 'GST: 10AABCB1234M1Z5' },
    { label: 'CIN: U51909BR2021PTC001234' },
];

export const LEGAL_ADDRESS = 'Bivha Technology Pvt. Ltd., Patna, Bihar – 800001';

// ─────────────────────────────────────────
// Bottom Bar Links
// ─────────────────────────────────────────
export const BOTTOM_LINKS = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
    { label: 'Grievance Officer', href: '#' },
];

export const COPYRIGHT = '© 2026 Kiranase — All Rights Reserved.';

// ─────────────────────────────────────────
// Brand Info
// ─────────────────────────────────────────

export const BRAND = {
    img: '/photo/Kiranase-logo.png',
    tagline: 'Kiranase delivers fresh groceries at prices cheaper than your local bazaar.Order from 7000+ products across 10,000+ pincodes in India.',
    rating: '4.9',
    reviews: '12,400+',
    href: '/',
};