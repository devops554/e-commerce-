"use client"

import { useState, useEffect } from 'react'

export function useNotifications() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Mock data fetching
    useEffect(() => {
        setUnreadCount(3)
    }, [])

    const markAsRead = (id: string) => {
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = () => {
        setUnreadCount(0)
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading
    }
}
