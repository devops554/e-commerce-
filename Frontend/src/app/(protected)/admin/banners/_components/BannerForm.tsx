"use client"
import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import SimpleImageUpload from '@/components/SimpleImageUpload'
import { BannerStatus, BannerType, BANNER_TYPE } from '@/services/banner.service'
import { useCreateBanner, useUpdateBanner, useBanner } from '@/hooks/useBanner'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
const bannerSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().optional(),
    mobileImage: z.string().optional(),
    pages: z.array(z.string() as z.ZodType<BannerType>).min(1, 'Select at least one page'),
    status: z.nativeEnum(BannerStatus),
    showSearchBar: z.boolean().default(true),
    showStats: z.boolean().default(false),
    primaryButton: z.object({
        text: z.string().optional(),
        link: z.string().optional(),
    }).optional(),
    secondaryButton: z.object({
        text: z.string().optional(),
        link: z.string().optional(),
    }).optional(),
    stats: z.array(z.object({
        label: z.string(),
        value: z.string(),
    })).optional(),
})

type BannerFormValues = z.infer<typeof bannerSchema>

interface BannerFormProps {
    id?: string
    onSuccess: () => void
    onCancel: () => void
}

const BannerForm = ({ id, onSuccess, onCancel }: BannerFormProps) => {
    const { data: banner, isLoading: isFetching } = useBanner(id as string, !!id)
    const { mutate: createBanner, isPending: isCreating } = useCreateBanner()
    const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner()

    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema) as any,
        defaultValues: {
            title: '',
            subtitle: '',
            description: '',
            backgroundImage: '',
            mobileImage: '',
            pages: [BANNER_TYPE.HOME],
            status: BannerStatus.ACTIVE,
            showSearchBar: true,
            showStats: false,
            primaryButton: { text: '', link: '' },
            secondaryButton: { text: '', link: '' },
            stats: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'stats',
    })

    useEffect(() => {
        if (banner) {
            form.reset({
                title: banner.title,
                subtitle: banner.subtitle || '',
                description: banner.description || '',
                backgroundImage: banner.backgroundImage || '',
                mobileImage: banner.mobileImage || '',
                pages: banner.pages,
                status: banner.status,
                showSearchBar: banner.showSearchBar,
                showStats: banner.showStats,
                primaryButton: banner.primaryButton || { text: '', link: '' },
                secondaryButton: banner.secondaryButton || { text: '', link: '' },
                stats: banner.stats || [],
            })
        }
    }, [banner, form])

    const onSubmit = (values: BannerFormValues) => {
        // Scrub empty buttons to avoid backend validation errors
        const cleanedValues = { ...values }
        if (!cleanedValues.primaryButton?.text?.trim() && !cleanedValues.primaryButton?.link?.trim()) {
            delete cleanedValues.primaryButton
        }
        if (!cleanedValues.secondaryButton?.text?.trim() && !cleanedValues.secondaryButton?.link?.trim()) {
            delete cleanedValues.secondaryButton
        }

        if (id) {
            updateBanner({ id, data: cleanedValues }, { onSuccess })
        } else {
            createBanner(cleanedValues, { onSuccess })
        }
    }

    if (isFetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1">
                    {/* Basic Info */}

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Main heading" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subtitle</FormLabel>
                                <FormControl>
                                    <Input placeholder="Smaller heading above title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <FormField
                        control={form.control}
                        name="backgroundImage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                <FormControl>
                                    <SimpleImageUpload
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        label="Desktop/Background Image"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mobileImage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile Image</FormLabel>
                                <FormControl>
                                    <SimpleImageUpload
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        label="Mobile Specific Image (Optional)"
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
                                    <Textarea placeholder="Short text below title" className="resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(BannerStatus).map((s) => (
                                            <SelectItem key={s} value={s} className="capitalize">
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="showSearchBar"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">Show Search Bar</FormLabel>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="showStats"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">Show Stats</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>

                </div>

                <Separator />

                {/* Pages Select */}
                <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Pages</FormLabel>
                            <div className="flex flex-wrap gap-4 pt-2">
                                {Object.values(BANNER_TYPE).map((page) => (
                                    <div key={page} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={field.value.includes(page)}
                                            onCheckedChange={(checked) => {
                                                const current = [...field.value]
                                                if (checked) {
                                                    field.onChange([...current, page])
                                                } else {
                                                    field.onChange(current.filter((p) => p !== page))
                                                }
                                            }}
                                        />
                                        <span className="text-sm capitalize">{page}</span>
                                    </div>
                                ))}
                            </div>
                            <FormDescription>Where should this banner be displayed?</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                {/* Buttons */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-4 space-y-4">
                            <h3 className="font-medium">Primary Button</h3>
                            <FormField
                                control={form.control}
                                name="primaryButton.text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Text</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Shop Now" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="primaryButton.link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="/shop" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 space-y-4">
                            <h3 className="font-medium">Secondary Button</h3>
                            <FormField
                                control={form.control}
                                name="secondaryButton.text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Text</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Learn More" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="secondaryButton.link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="/about" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                {form.watch('showStats') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Banner Stats</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ label: '', value: '' })}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Stat
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {fields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardContent className="pt-4 relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1 h-6 w-6"
                                            onClick={() => remove(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name={`stats.${index}.label`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Label</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Brands" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`stats.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Value</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="200+" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || isUpdating}>
                        {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {id ? 'Update Banner' : 'Create Banner'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default BannerForm
