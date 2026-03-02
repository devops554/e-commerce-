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
import { Badge } from '@/components/ui/badge'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true),
    parentId: z.string().nullable().default(null),
    productType: z.string(),
    // We are not editing attributes here, but we pass them along if needed, or omit them
    // from the schema edit since they are inherited.
    attributes: z.array(z.object({
        name: z.string()
    })).default([]),
})

interface SubcategoryFormProps {
    initialData?: Category | null;
    parentCategory: Category;
    onSubmit: (data: z.infer<typeof formSchema>) => void;
    isLoading?: boolean;
}

export default function SubcategoryForm({ initialData, parentCategory, onSubmit, isLoading }: SubcategoryFormProps) {
    const defaultProductType = typeof parentCategory.productType === 'object'
        ? parentCategory.productType._id
        : parentCategory.productType;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            image: initialData?.image || '',
            isActive: initialData?.isActive ?? true,
            parentId: parentCategory._id,
            productType: defaultProductType || '',
            attributes: initialData?.attributes || parentCategory.attributes || [],
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
                                <FormLabel>Subcategory Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Laptops" {...field} />
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

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">Inherited Information</p>
                        <Badge variant="outline" className="bg-white">From: {parentCategory.name}</Badge>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Product Type</p>
                        <p className="text-sm text-slate-900 font-medium">
                            {typeof parentCategory.productType === 'object' ? parentCategory.productType.name : 'Inherited from parent'}
                        </p>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-slate-500">Attributes</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs rounded-lg"
                                onClick={() => append({ name: '' })}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                                No attributes. Click "Add" to create one.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`attributes.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1 space-y-0">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Color, Size"
                                                            className="bg-white h-9 text-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] mt-1" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief description of the subcategory..."
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
                            <FormLabel>Subcategory Image</FormLabel>
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
                            initialData ? 'Update Subcategory' : 'Create Subcategory'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
