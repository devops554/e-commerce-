"use client"

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import SimpleImageUpload from '../SimpleImageUpload'
import { ProductType } from '@/services/productType.service'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
    order: z.number().default(0),
})

interface ProductTypeFormProps {
    initialData?: ProductType | null;
    onSubmit: (data: z.infer<typeof formSchema>) => void;
    isLoading?: boolean;
}

export default function ProductTypeForm({ initialData, onSubmit, isLoading }: ProductTypeFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            image: initialData?.image || '',
            isActive: initialData?.isActive ?? true,
            order: (initialData as any)?.order ?? 0,
        },
    })

    const watchName = form.watch('name')
    useEffect(() => {
        if (!initialData && watchName) {
            const slug = watchName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            form.setValue('slug', slug)
        }
    }, [watchName, initialData, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
                    <div className="space-y-6 pb-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Electronics, Clothing" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch('slug') && (
                                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">URL Slug (Auto-generated)</p>
                                    <p className="text-sm font-mono text-slate-600">/{form.watch('slug')}</p>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                        <SimpleImageUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Upload Banner"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Order</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Lower numbers appear first in lists.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active Status</FormLabel>
                                        <FormDescription>Visible in filtering and selection.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </ScrollArea>

                {/* Submit Button - always visible, outside scroll area */}
                <div className="flex justify-end gap-4 pt-4 border-t mt-2 flex-shrink-0">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            initialData ? 'Update Type' : 'Create Type'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
