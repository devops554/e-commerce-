import { Injectable, NotFoundException, ConflictException, OnModuleInit, BadRequestException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductVariant } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { RedisService } from '../redis/redis.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService implements OnModuleInit {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariant>,
        private readonly redisService: RedisService,
        private readonly categoriesService: CategoriesService,
    ) { }

    // ─── INITIALIZATION ───

    async onModuleInit() {
        try {
            this.logger.log('Initializing ProductsService: Syncing indexes and clearing caches...');

            // Drop legacy unique index on 'sku' in 'products' collection if it exists
            const indexes = await this.productModel.collection.indexes();
            if (indexes.some(idx => idx.name === 'sku_1')) {
                await this.productModel.collection.dropIndex('sku_1');
                this.logger.log('Successfully dropped legacy unique index "sku_1" from products collection');
            }

            // Sync all active products to search autocomplete index
            const products = await this.productModel
                .find({ isDeleted: false, isActive: true }, 'title slug brand keywords tags seo shortDescription')
                .exec();
            for (const product of products) {
                this.indexProductForAutocomplete(product);
            }

            // Clear ALL product-related caches on startup
            await this.redisService.delByPattern('products:*');
            await this.redisService.delByPattern('product:detail:*');
            await this.redisService.delByPattern('product:variants:*');
            this.logger.log('Cleared all product-related Redis caches on startup');

        } catch (error) {
            this.logger.error(`Error in ProductsService onModuleInit: ${error.message}`, error.stack);
        }
    }

    // ─── HELPER METHODS ───

    private validateObjectId(id: string, name: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
        }
    }

    // ─── AUTOCOMPLETE INDEXING ───

    /**
     * Adds every searchable keyword for a product into the Redis
     * autocomplete sorted set so that getSuggestions() can find them.
     * Indexed terms: title, slug, brand, keywords[], tags[]
     */
    private indexProductForAutocomplete(product: {
        title?: string;
        slug?: string;
        brand?: string;
        keywords?: string[];
        tags?: string[];
        seo?: { keywords?: string[] };
        shortDescription?: string;
    }) {
        const terms = new Set<string>();

        // Index the full title
        if (product.title) terms.add(product.title.toLowerCase());

        // Index individual words from title (e.g. "Fresh", "Potato", "Aloo" from "Fresh Potato (Aloo)")
        if (product.title) {
            product.title
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')   // strip parens, hyphens etc.
                .split(/\s+/)
                .filter(w => w.length > 2)
                .forEach(w => terms.add(w));
        }

        // Index slug words (e.g. "fresh", "potato", "aloo" from "fresh-potato-aloo")
        if (product.slug) {
            product.slug.toLowerCase().split('-').filter(w => w.length > 2).forEach(w => terms.add(w));
            terms.add(product.slug.toLowerCase());
        }

        // Index brand
        if (product.brand) terms.add(product.brand.toLowerCase());

        // Index keywords[]
        for (const kw of product.keywords ?? []) if (kw) terms.add(kw.toLowerCase());

        // Index tags[]
        for (const tag of product.tags ?? []) if (tag) terms.add(tag.toLowerCase());

        // Index seo.keywords[] as well
        for (const kw of product.seo?.keywords ?? []) if (kw) terms.add(kw.toLowerCase());

        // Index individual words from shortDescription
        if (product.shortDescription) {
            product.shortDescription
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 2)
                .forEach(w => terms.add(w));
        }

        for (const term of terms) {
            this.redisService
                .zadd('autocomplete:products', 0, term)
                .catch(err => this.logger.warn(`Autocomplete index failed for "${term}": ${err.message}`));
        }
    }

    // ─── SYNC KEYWORDS TO SEARCH ───

    private syncKeywords(data: any) {
        // Ensure keywords are synced from SEO keywords for better search coverage
        if (data.seo?.keywords && Array.isArray(data.seo.keywords)) {
            if (!data.keywords || data.keywords.length === 0) {
                data.keywords = [...data.seo.keywords];
            } else {
                // Merge and remove duplicates
                data.keywords = Array.from(new Set([...data.keywords, ...data.seo.keywords]));
            }
        }
    }

    private async invalidateProductCache(productId: string, slug?: string) {
        try {
            const keys = [
                `product:detail:${productId}`,
                `product:variants:${productId}`
            ];

            if (slug) {
                keys.push(`product:detail:${slug}`);
            } else {
                // If slug not provided, try to find it from DB to ensure detail cache is cleared
                const product = await this.productModel.findById(productId, 'slug').exec();
                if (product?.slug) {
                    keys.push(`product:detail:${product.slug}`);
                }
            }

            // Delete specific keys
            await this.redisService.del(keys);

            // Clear all product list caches
            await this.redisService.delByPattern('products:*');
        } catch (error) {
            this.logger.warn(`Cache invalidation failed for product ${productId}: ${error.message}`);
        }
    }

    // ─── PRODUCT CRUD ───

    async create(createProductDto: CreateProductDto, createdBy: string): Promise<Product> {
        try {
            const slug = createProductDto.slug || slugify(createProductDto.title, { lower: true, strict: true });

            const existing = await this.productModel.findOne({ slug }).exec();
            if (existing) {
                throw new ConflictException(`Product with slug "${slug}" already exists`);
            }

            const productData = { ...createProductDto };
            this.syncKeywords(productData);

            if (productData.order === undefined) {
                const lastProduct = await this.productModel.findOne().sort({ order: -1 }).exec();
                productData.order = lastProduct ? lastProduct.order + 1 : 1;
            }

            const product = new this.productModel({
                ...productData,
                slug,
                createdBy: new Types.ObjectId(createdBy)
            });
            const savedProduct = await product.save();

            // Fire and forget side effects
            this.indexProductForAutocomplete(savedProduct);
            this.invalidateProductCache(savedProduct._id.toString(), savedProduct.slug).catch(() => { });

            this.logger.log(`Product created: ${savedProduct.title} (${savedProduct._id})`);
            return savedProduct;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to create product: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create product');
        }
    }

    async findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        subCategory?: string;
        brand?: string;
        isActive?: boolean;
        productType?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
    }) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                category,
                subCategory,
                brand,
                isActive,
                productType,
                minPrice,
                maxPrice,
                sort = 'order'
            } = query;
            const skip = (page - 1) * limit;

            const andConditions: any[] = [{ isDeleted: false }];

            if (search) {
                // Escape special regex characters to prevent injection and encoding bugs
                const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const searchRegex = new RegExp(escapedSearch, 'i');

                // 1. Find matching variants for (sku, attributes.value, price)
                const variantQuery: any[] = [
                    { sku: searchRegex },
                    { 'attributes.value': searchRegex }
                ];

                const searchNumber = Number(search);
                if (!isNaN(searchNumber)) {
                    variantQuery.push({ price: searchNumber });
                    variantQuery.push({ discountPrice: searchNumber });
                }

                const matchingVariants = await this.variantModel
                    .find({ $or: variantQuery, isActive: true })
                    .select('product')
                    .exec();

                const matchingProductIds = matchingVariants.map(v => v.product);

                // 2. Combine with Product fields
                const productSearchQueries: any[] = [
                    { title: searchRegex },
                    { slug: searchRegex },
                    { baseSku: searchRegex },
                    { brand: searchRegex },
                    { shortDescription: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                    { keywords: searchRegex },
                    { 'manufacturerInfo.name': searchRegex },
                    { 'highLight.ingredients': searchRegex },
                ];

                if (matchingProductIds.length > 0) {
                    productSearchQueries.push({ _id: { $in: matchingProductIds } });
                }
                andConditions.push({ $or: productSearchQueries });
            }

            if (category) {
                const idStr = category.toString();
                const idObj = Types.ObjectId.isValid(idStr) ? new Types.ObjectId(idStr) : null;
                const matchIds: any[] = [idStr];
                if (idObj) {
                    matchIds.push(idObj);
                    const childIds = await this.categoriesService.getSubCategoryIds(idStr);
                    childIds.forEach(id => {
                        matchIds.push(id);
                        if (Types.ObjectId.isValid(id)) matchIds.push(new Types.ObjectId(id));
                    });
                }

                andConditions.push({
                    $or: [
                        { category: { $in: matchIds } },
                        { subCategory: { $in: matchIds } }
                    ]
                });
            }

            if (subCategory) {
                const idStr = subCategory.toString();
                const idObj = Types.ObjectId.isValid(idStr) ? new Types.ObjectId(idStr) : null;
                const matchIds = idObj ? [idObj, idStr] : [idStr];
                andConditions.push({
                    $or: [
                        { category: { $in: matchIds } },
                        { subCategory: { $in: matchIds } }
                    ]
                });
            }

            if (brand) {
                const brandList = brand.split(',').filter(Boolean).map(b => b.trim());
                if (brandList.length > 0) {
                    andConditions.push({ brand: { $in: brandList } });
                }
            }

            if (productType) {
                const idStr = productType.toString();
                const idObj = Types.ObjectId.isValid(idStr) ? new Types.ObjectId(idStr) : null;
                const matchIds = idObj ? [idObj, idStr] : [idStr];
                andConditions.push({ productType: { $in: matchIds } });
            }

            if (isActive !== undefined) {
                andConditions.push({ isActive: String(isActive) === 'true' });
            }

            // --- PRICE FILTERING ---
            if (minPrice !== undefined || maxPrice !== undefined) {
                const priceMatch: any = { isActive: true };
                if (minPrice !== undefined) priceMatch.price = { $gte: minPrice };
                if (maxPrice !== undefined) {
                    priceMatch.price = { ...priceMatch.price, $lte: maxPrice };
                }

                const priceMatchingVariants = await this.variantModel
                    .find(priceMatch)
                    .select('product')
                    .exec();

                const priceMatchingIds = Array.from(new Set(priceMatchingVariants.map(v => v.product.toString())));

                // If no variants match, we should ensure no products are found
                if (priceMatchingIds.length === 0) {
                    andConditions.push({ _id: new Types.ObjectId() }); // Condition that will never be met
                } else {
                    andConditions.push({ _id: { $in: priceMatchingIds.map(id => new Types.ObjectId(id)) } });
                }
            }

            const filter = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

            // NOTE: Do NOT use JSON.stringify(filter) — RegExp serialises to {}, making all
            // searches share the same broken cache key. Use a readable string key instead.
            const sortOption: any = sort ? sort : { order: 1, _id: -1 };
            const cacheKey = `products:list:s=${search ?? ''}:cat=${category ?? ''}:sub=${subCategory ?? ''}:brand=${brand ?? ''}:pt=${productType ?? ''}:active=${isActive ?? ''}:min=${minPrice ?? ''}:max=${maxPrice ?? ''}:sort=${JSON.stringify(sortOption)}:p=${skip}:l=${limit}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) return cached;

            const [products, total] = await Promise.all([
                this.productModel
                    .find(filter)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .populate('productType', 'name slug')
                    .populate('category', 'name slug')
                    .populate('subCategory', 'name slug')
                    .populate('createdBy', 'name')
                    .exec(),
                this.productModel.countDocuments(filter).exec(),
            ]);

            const productIds = products.map(p => p._id);
            const variants = await this.variantModel
                .find({ product: { $in: productIds }, isActive: true })
                .exec();

            const variantsByProduct: Record<string, any[]> = {};
            for (const v of variants) {
                const pid = v.product.toString();
                if (!variantsByProduct[pid]) variantsByProduct[pid] = [];
                variantsByProduct[pid].push(v);
            }

            // Filter products that have no active variants if isActive: true is requested
            let productsWithVariants = products.map(p => {
                const productObj = p.toObject({ virtuals: true, getters: true });
                return {
                    ...productObj,
                    variants: variantsByProduct[p._id.toString()] || [],
                };
            });

            // If shop context (isActive=true), filter out products without variants
            if (isActive === true || String(isActive) === 'true') {
                productsWithVariants = productsWithVariants.filter(p => p.variants && p.variants.length > 0);
            }

            const finalTotal = (isActive === true || String(isActive) === 'true') ? productsWithVariants.length : total;

            const result = {
                products: productsWithVariants,
                total: finalTotal,
                page,
                limit,
                totalPages: Math.ceil(finalTotal / limit),
            };

            this.redisService.set(cacheKey, result, 3600).catch(() => { });

            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch products');
        }
    }

    async findOne(idOrSlug: string): Promise<any> {
        try {
            const cacheKey = `product:detail:${idOrSlug}`;

            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                this.redisService.incr(`stats:product:views:${cached._id}`).catch(() => { });
                return cached;
            }

            const product = await this.productModel
                .findOne({
                    $or: [{ _id: Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null }, { slug: idOrSlug }],
                    isDeleted: false
                })
                .populate('productType', 'name slug')
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .populate('createdBy', 'name')
                .exec();

            if (!product) {
                throw new NotFoundException(`Product "${idOrSlug}" not found`);
            }

            const variants = await this.variantModel.find({ product: product._id, isActive: true }).exec();

            const result = {
                ...product.toObject(),
                variants,
            };

            this.redisService.set(cacheKey, result, 3600).catch(() => { });
            if (idOrSlug === product.slug) {
                this.redisService.set(`product:detail:${product._id}`, result, 3600).catch(() => { });
            } else {
                this.redisService.set(`product:detail:${product.slug}`, result, 3600).catch(() => { });
            }

            this.redisService.incr(`stats:product:views:${product._id}`).catch(() => { });

            return result;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to fetch product ${idOrSlug}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Resource fetch failed');
        }
    }

    async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
        try {
            this.validateObjectId(id, 'product');
            const updateData: any = { ...updateProductDto };

            // Ensure createdBy is NOT updated
            delete updateData.createdBy;

            // Track who updated this
            updateData.updatedBy = new Types.ObjectId(userId);

            if (updateProductDto.title && !updateProductDto.slug) {
                updateData.slug = slugify(updateProductDto.title, { lower: true, strict: true });
            }

            this.syncKeywords(updateData);

            const product = await this.productModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .exec();

            if (!product) {
                throw new NotFoundException(`Product ID ${id} not found`);
            }

            this.invalidateProductCache(product._id.toString(), product.slug).catch(() => { });

            // Re-index all autocomplete terms whenever the product changes
            this.indexProductForAutocomplete(product);

            this.logger.log(`Product updated: ${product.title} (${product._id})`);
            return product;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to update product ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Update failed');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            this.validateObjectId(id, 'product');
            const product = await this.productModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
            if (!product) {
                throw new NotFoundException(`Product ID ${id} not found`);
            }

            this.invalidateProductCache(id, product.slug).catch(() => { });
            this.logger.warn(`Product soft-deleted: ${product.title} (${id})`);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to delete product ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Delete failed');
        }
    }

    // ─── VARIANT OPERATIONS ───

    async createVariant(createVariantDto: CreateVariantDto): Promise<ProductVariant> {
        try {
            this.validateObjectId(createVariantDto.product, 'product');

            const productExists = await this.productModel.exists({
                _id: createVariantDto.product,
                isDeleted: false,
            });

            if (!productExists) {
                throw new NotFoundException(`Parent product not found: ${createVariantDto.product}`);
            }

            const variant = new this.variantModel({
                ...createVariantDto,
                product: new Types.ObjectId(createVariantDto.product),
            });

            const savedVariant = await variant.save();
            this.invalidateProductCache(createVariantDto.product).catch(() => { });

            this.logger.log(`Variant created for product ${createVariantDto.product}: ${savedVariant.sku}`);
            return savedVariant;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to create variant: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Variant creation failed');
        }
    }

    async updateVariant(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant> {
        try {
            this.validateObjectId(id, 'variant');
            const variant = await this.variantModel.findByIdAndUpdate(id, updateVariantDto, { new: true }).exec();
            if (!variant) {
                throw new NotFoundException(`Variant ID ${id} not found`);
            }

            const productId = variant.product?.toString();
            if (productId) {
                this.invalidateProductCache(productId).catch(() => { });
            }

            return variant;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to update variant ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Variant update failed');
        }
    }

    async removeVariant(id: string): Promise<void> {
        try {
            this.validateObjectId(id, 'variant');
            const variant = await this.variantModel.findById(id).exec();
            if (!variant) {
                throw new NotFoundException(`Variant ID ${id} not found`);
            }

            await this.variantModel.findByIdAndDelete(id).exec();

            const productId = variant.product?.toString();
            if (productId) {
                this.invalidateProductCache(productId).catch(() => { });
            }
            this.logger.log(`Variant deleted: ${id}`);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to delete variant ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Variant deletion failed');
        }
    }

    async getProductVariants(productId: string): Promise<ProductVariant[]> {
        try {
            this.validateObjectId(productId, 'product');
            const cacheKey = `product:variants:${productId}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) return cached;

            const variants = await this.variantModel.find({ product: productId }).exec();
            this.redisService.set(cacheKey, variants, 3600).catch(() => { });
            return variants;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to fetch variants for product ${productId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch variants');
        }
    }

    async getSuggestions(query: string) {
        try {
            if (!query) return [];
            const start = `[${query.toLowerCase()}`;
            const stop = `[${query.toLowerCase()}\xff`;
            return await this.redisService.zrangebylex('autocomplete:products', start, stop);
        } catch (error) {
            this.logger.warn(`Suggestion fetch failed for "${query}": ${error.message}`);
            return [];
        }
    }
}
