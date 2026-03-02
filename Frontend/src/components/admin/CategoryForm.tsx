"use client"

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Category } from '@/services/category.service'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { SearchableSelect } from '../SearchableSelect'
import { useProductTypes } from '@/hooks/useProductTypes'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
    parentId: z.string().nullable().default(null),
    productType: z.string().min(2, 'Product type must be at least 2 characters'),
    attributes: z.array(z.object({
        name: z.string().min(1, 'Attribute name is required')
    })).default([]),
    order: z.number().default(0),
})

interface CategoryFormProps {
    initialData?: Category | null;
    onSubmit: (data: z.infer<typeof formSchema>) => void;
    isLoading?: boolean;
    parentSlug?: string | null;
}

export default function CategoryForm({ initialData, onSubmit, isLoading, parentSlug }: CategoryFormProps) {
    const { data: productTypesData } = useProductTypes({ limit: 100 })
    const productTypes = productTypesData?.productTypes || []

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            image: initialData?.image || '',
            isActive: initialData?.isActive ?? true,
            parentId: initialData?.parentId || null,
            productType: typeof initialData?.productType === 'object'
                ? initialData.productType._id
                : initialData?.productType || '',
            attributes: initialData?.attributes || [],
            order: initialData?.order || 0,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "attributes",
    })

    // Auto-generate slug from name
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Electronics" {...field} />
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
                    name="productType"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <SearchableSelect
                                    label="Product Type"
                                    placeholder="Select a product type..."
                                    items={productTypes}
                                    selectedId={field.value}
                                    onSelect={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief description of the category..."
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
                            <FormLabel>Category Image</FormLabel>
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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel>Category Attributes</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg"
                            onClick={() => append({ name: '' })}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Attribute
                        </Button>
                    </div>

                    {fields.length === 0 ? (
                        <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                            No attributes added yet. Click &quot;Add Attribute&quot; to create one.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <FormField
                                            control={form.control}
                                            name={`attributes.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Color, Size, Material"
                                                            className="bg-white"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                                <FormDescription>
                                    Visible to customers in the store.
                                </FormDescription>
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

                <div className="flex justify-end gap-4 pt-4 border-t">
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
                            initialData ? 'Update Category' : 'Create Category'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
