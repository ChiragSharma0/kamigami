const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const productsService = require('../products/products.service');
const dropsService = require('../drops/drops.service');
const inventoryService = require('../inventory/inventory.service');

// Helper to log admin actions
async function logAction(tx, adminId, action, entityId, metadata = {}) {
  await tx.adminLog.create({
    data: {
      adminId,
      action,
      entityId: entityId?.toString(),
      metadata
    }
  });
}

// 1. PRODUCT MANAGEMENT
exports.listProducts = async (filters) => {
  return await productsService.listProducts({ ...filters, isAdmin: true });
};

exports.getProduct = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { name: true, slug: true, id: true } },
      variants: {
        include: { inventory: true }
      }
    }
  });

  if (!product) throw new AppError('Product not found', 404);
  return product;
};

exports.createProduct = async (adminId, productData) => {
  console.log(`[AdminService] Creating product: ${productData.name} with ${productData.variants?.length || 0} variants`);
  const product = await prisma.$transaction(async (tx) => {
    // Check slug uniqueness
    const existing = await tx.product.findUnique({ where: { slug: productData.slug } });
    if (existing) {
      console.error(`[AdminService] Slug already exists: ${productData.slug}`);
      throw new AppError('Product slug already exists', 409);
    }

    const newProduct = await tx.product.create({
      data: {
        sku: productData.sku,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        basePrice: productData.basePrice,
        categoryId: productData.categoryId || null,
        isDrop: productData.isDrop || false,
        status: 'PUBLISHED',
        variants: {
          create: productData.variants.map(v => ({
            sku: v.sku,
            attributes: v.attributes,
            price: v.price || productData.basePrice,
            inventory: {
              create: {
                stockTotal: parseInt(v.initialStock) || 0,
                stockAvailable: parseInt(v.initialStock) || 0,
                stockReserved: 0
              }
            }
          }))
        }
      },
      include: { variants: { include: { inventory: true } } }
    });

    if (productData.mediaIds && productData.mediaIds.length > 0) {
      await tx.productMedia.createMany({
        data: productData.mediaIds.map((mediaId, index) => ({
          productId: newProduct.id,
          mediaId,
          position: index
        }))
      });
    }

    console.log(`[AdminService] Product created successfully: ${newProduct.id}`);
    await logAction(tx, adminId, 'created_product', newProduct.id, { slug: newProduct.slug });
    return newProduct;
  });

  // Invalidate Cache after transaction
  const cache = require('../../common/utils/cache');
  await cache.deleteByPattern('products:list:*');

  return product;
};

exports.updateProduct = async (adminId, productId, updateData) => {
  console.log(`[AdminService] Updating product ${productId} with ${updateData.variants?.length || 0} variants`);
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update top-level product fields
    const product = await tx.product.update({
      where: { id: productId },
      data: {
        name: updateData.name,
        slug: updateData.slug,
        sku: updateData.sku,
        description: updateData.description,
        basePrice: updateData.basePrice,
        categoryId: updateData.categoryId || null,
        isDrop: updateData.isDrop !== undefined ? updateData.isDrop : undefined,
        status: updateData.status,
        deletedAt: updateData.deletedAt
      },
      include: { variants: true }
    });

    // 2. Sync Variants
    if (updateData.variants && Array.isArray(updateData.variants)) {
      const incomingVariantIds = updateData.variants.filter(v => v.id).map(v => v.id);

      // Delete variants not in incoming list
      await tx.productVariant.deleteMany({
        where: {
          productId,
          id: { notIn: incomingVariantIds }
        }
      });

      // Upsert incoming variants
      for (const v of updateData.variants) {
        if (v.id) {
          // Update existing
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              attributes: v.attributes,
              price: v.price || updateData.basePrice
            }
          });
          // Note: We don't typically update stock via product edit for existing variants 
          // to avoid overwriting real-time stock. Use Inventory Control for that.
        } else {
          // Create new variant
          await tx.productVariant.create({
            data: {
              productId,
              sku: v.sku,
              attributes: v.attributes,
              price: v.price || updateData.basePrice,
              inventory: {
                create: {
                  stockTotal: parseInt(v.initialStock) || 0,
                  stockAvailable: parseInt(v.initialStock) || 0,
                  stockReserved: 0
                }
              }
            }
          });
        }
      }
    }

    if (updateData.mediaIds !== undefined) {
      await tx.productMedia.deleteMany({ where: { productId } });
      if (updateData.mediaIds.length > 0) {
        await tx.productMedia.createMany({
          data: updateData.mediaIds.map((mediaId, index) => ({
            productId,
            mediaId,
            position: index
          }))
        });
      }
    }

    await logAction(tx, adminId, 'updated_product', product.id);
    return product;
  });

  // Invalidate Cache
  const cache = require('../../common/utils/cache');
  await cache.deleteCache(`product:${result.slug}`);
  await cache.deleteByPattern('products:list:*');

  return result;
};

exports.deleteProduct = async (adminId, productId) => {
  const result = await prisma.$transaction(async (tx) => {
    // Check if used in active drop
    const activeDrop = await tx.dropProduct.findFirst({
      where: {
        productId,
        drop: { status: 'ACTIVE' }
      }
    });

    if (activeDrop) {
      throw new AppError('Cannot delete product used in an active drop', 400);
    }

    const product = await tx.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), status: 'DRAFT' }
    });

    await logAction(tx, adminId, 'deleted_product', product.id);
    return product;
  });

  // Invalidate Cache
  const cache = require('../../common/utils/cache');
  await cache.deleteCache(`product:${result.slug}`);
  await cache.deleteByPattern('products:list:*');

  return result;
};

// 2. CATEGORY MANAGEMENT
exports.listCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

exports.createCategory = async (adminId, categoryData) => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.category.findUnique({ where: { slug: categoryData.slug } });
    if (existing) throw new AppError('Category slug already exists', 409);

    const category = await tx.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
      }
    });

    await logAction(tx, adminId, 'created_category', category.id, { name: category.name });
    return category;
  });
};

exports.updateCategory = async (adminId, categoryId, updateData) => {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.update({
      where: { id: categoryId },
      data: {
        name: updateData.name,
        slug: updateData.slug,
        description: updateData.description,
        isActive: updateData.isActive
      }
    });

    await logAction(tx, adminId, 'updated_category', category.id);
    return category;
  });
};

// 3. DROP MANAGEMENT
exports.listDrops = async (status) => {
  return await dropsService.listDrops(status);
};

exports.createDrop = async (adminId, dropData) => {
  const result = await prisma.$transaction(async (tx) => {
    const drop = await tx.drop.create({
      data: {
        title: dropData.title,
        slug: dropData.slug,
        description: dropData.description,
        description: dropData.description,
        startTime: new Date(dropData.startTime),
        endTime: new Date(dropData.endTime),
        status: 'SCHEDULED'
      }
    });

    if (dropData.mediaIds && dropData.mediaIds.length > 0) {
      await tx.dropMedia.createMany({
        data: dropData.mediaIds.map((mediaId, index) => ({
          dropId: drop.id,
          mediaId,
          position: index
        }))
      });
    }

    await logAction(tx, adminId, 'created_drop', drop.id, { slug: drop.slug });
    return drop;
  });

  // Invalidate Cache
  const cache = require('../../common/utils/cache');
  await cache.deleteByPattern('drops:list:*');

  return result;
};

exports.updateDrop = async (adminId, dropId, dropData) => {
  const result = await prisma.$transaction(async (tx) => {
    const drop = await tx.drop.findUnique({ where: { id: dropId } });
    if (!drop) throw new AppError('Drop not found', 404);

    const updated = await tx.drop.update({
      where: { id: dropId },
      data: {
        title: dropData.title,
        description: dropData.description,
        description: dropData.description,
        startTime: dropData.startTime ? new Date(dropData.startTime) : undefined,
        endTime: dropData.endTime ? new Date(dropData.endTime) : undefined,
        status: dropData.status
      }
    });

    if (dropData.mediaIds !== undefined) {
      await tx.dropMedia.deleteMany({ where: { dropId } });
      if (dropData.mediaIds.length > 0) {
        await tx.dropMedia.createMany({
          data: dropData.mediaIds.map((mediaId, index) => ({
            dropId,
            mediaId,
            position: index
          }))
        });
      }
    }

    await logAction(tx, adminId, 'updated_drop', updated.id, { slug: updated.slug });
    return updated;
  });

  const cache = require('../../common/utils/cache');
  await cache.deleteCache(`drop:${result.slug}`);
  await cache.deleteByPattern('drops:list:*');
  return result;
};

exports.deleteDrop = async (adminId, dropId) => {
  const result = await prisma.$transaction(async (tx) => {
    const drop = await tx.drop.findUnique({ where: { id: dropId } });
    if (!drop) throw new AppError('Drop not found', 404);
    if (drop.status === 'ACTIVE') throw new AppError('Cannot delete an active drop', 400);

    await tx.dropProduct.deleteMany({ where: { dropId } });
    await tx.drop.delete({ where: { id: dropId } });

    await logAction(tx, adminId, 'deleted_drop', dropId, { slug: drop.slug });
    return drop;
  });

  const cache = require('../../common/utils/cache');
  await cache.deleteByPattern('drops:list:*');
  return result;
};

exports.attachProductsToDrop = async (adminId, dropId, productAllocations = []) => {
  console.log(`[AdminService] Attaching ${productAllocations?.length || 0} products to drop ${dropId}`);

  if (!Array.isArray(productAllocations)) {
    throw new AppError('Product allocations must be an array', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const drop = await tx.drop.findUnique({ where: { id: dropId } });
    if (!drop) throw new AppError('Drop not found', 404);

    // Remove existing products first
    await tx.dropProduct.deleteMany({ where: { dropId } });

    const createdRecords = [];

    for (const p of productAllocations) {
      // Fetch product with variants and inventory for validation
      const product = await tx.product.findUnique({
        where: { id: p.productId },
        include: { variants: { include: { inventory: true } } }
      });

      if (!product) throw new AppError(`Product ${p.productId} not found`, 404);

      let finalAllocations = {};

      if (p.variantAllocations) {
        // PER-VARIANT ALLOCATION (New system)
        finalAllocations = p.variantAllocations;

        // Validate each variant
        for (const [vId, stock] of Object.entries(finalAllocations)) {
          const variant = product.variants.find(v => v.id === vId);
          if (!variant) throw new AppError(`Variant ${vId} not found for product ${product.name}`, 404);

          const allocated = parseInt(stock) || 0;
          if (allocated > variant.inventory.stockAvailable) {
            throw new AppError(`Cannot allocate ${allocated} for ${product.name} (${variant.sku}). Warehouse only has ${variant.inventory.stockAvailable}.`, 400);
          }
        }
      } else {
        // BACKWARD COMPATIBILITY: Product-level allocation
        // If they just sent dropStock, we distribute it or set it as a cap
        // For simplicity and to encourage the new system, we'll store it as a generic product cap or distribute
        // But for now, let's just convert it to variant allocations if possible
        const stock = parseInt(p.dropStock) || 0;
        product.variants.forEach(v => {
          finalAllocations[v.id] = Math.min(stock, v.inventory.stockAvailable);
        });
      }

      createdRecords.push({
        dropId,
        productId: p.productId,
        variantAllocations: finalAllocations
      });
    }

    if (createdRecords.length > 0) {
      await tx.dropProduct.createMany({ data: createdRecords });
    }

    await logAction(tx, adminId, 'attached_products_to_drop', drop.id, { productCount: createdRecords.length });
    return { drop, count: createdRecords.length };
  });

  // Invalidate Cache
  try {
    const cache = require('../../common/utils/cache');
    await cache.deleteCache(`drop:${result.drop.slug}`);
    await cache.deleteByPattern('drops:list:*');
  } catch (cacheErr) {
    console.warn('[AdminService] Cache invalidation failed:', cacheErr.message);
  }

  return result;
};

exports.attachCollectionToDrop = async (adminId, dropId, collectionId, defaultStock = 100) => {
  // First get products from collection
  const collectionProducts = await prisma.collectionProduct.findMany({
    where: { collectionId },
    select: { productId: true }
  });

  if (collectionProducts.length === 0) throw new AppError('Collection is empty', 400);

  const allocations = collectionProducts.map(cp => ({
    productId: cp.productId,
    dropStock: defaultStock // This will be distributed by attachProductsToDrop
  }));

  return await exports.attachProductsToDrop(adminId, dropId, allocations);
};

// 3. INVENTORY MANAGEMENT
exports.updateInventory = async (adminId, variantId, changeAmount, reason) => {
  return await prisma.$transaction(async (tx) => {
    const result = await inventoryService.updateStock({ variantId, changeAmount, reason }, adminId);
    await logAction(tx, adminId, 'updated_inventory', variantId, { changeAmount, reason });
    return result;
  });
};

exports.setInventory = async (adminId, variantId, stockTotal) => {
  return await prisma.$transaction(async (tx) => {
    const result = await inventoryService.setAbsoluteStock({ variantId, stockTotal }, adminId);
    await logAction(tx, adminId, 'set_inventory', variantId, { stockTotal });
    return result;
  });
};

exports.getInventory = async (variantId) => {
  return await prisma.inventory.findUnique({
    where: { variantId },
    include: {
      variant: {
        include: { product: true }
      }
    }
  });
};

exports.getInventoryLogs = async (variantId) => {
  return await prisma.inventoryLog.findMany({
    where: { variantId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    }
  });
};

// 4. ORDER VIEWING
exports.listOrders = async (filters) => {
  const { status, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    }),
    prisma.order.count({ where })
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

exports.getOrderDetails = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: { email: true, firstName: true, lastName: true, phoneNumber: true }
      }
    }
  });

  if (!order) throw new AppError('Order not found', 404);
  return order;
};
