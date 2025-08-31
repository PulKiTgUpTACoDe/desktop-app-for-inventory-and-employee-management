import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌰 Seeding database...')

    // Clear existing data (optional)
    const models = [
        'payslip', 'payroll', 'employee', 'payment', 'invoice',
        'salesOrderItem', 'salesOrder', 'purchaseOrderItem',
        'purchaseOrder', 'stock', 'product', 'productBrand',
        'productCategory', 'vendor', 'supplier', 'adminUser'
    ]
    // Delete all data from each model in order
    for (const model of models) {
        await (prisma as any)[model].deleteMany();
    }

    // Admin users
    const adminUsersData = [
        { username: 'admin', password: 'admin123', email: 'admin@swarajdryfruits.com', fullName: 'Rajesh Kumar', role: 'admin' },
        { username: 'manager', password: 'manager123', email: 'manager@swarajdryfruits.com', fullName: 'Priya Sharma', role: 'manager' },
        { username: 'supervisor', password: 'supervisor123', email: 'supervisor@swarajdryfruits.com', fullName: 'Amit Patel', role: 'supervisor' }
    ]
    const adminUsers = await Promise.all(adminUsersData.map(u =>
        prisma.adminUser.create({ data: { ...u, isActive: true } })
    ))
    const [adminUser, managerUser] = adminUsers

    // Generic function to create entities
    const createEntities = async (
        modelName: keyof typeof prisma,
        data: any[],
        extraFields = {}
    ) =>
        Promise.all(
            data.map(d =>
                (prisma[modelName] as any).create({ data: { ...d, ...extraFields } })
            )
        );

    // Product categories
    const categoriesData = [
        { name: 'Premium Dry Fruits', description: 'High-quality premium dry fruits' },
        { name: 'Regular Dry Fruits', description: 'Standard quality dry fruits' },
        { name: 'Nuts & Seeds', description: 'Various nuts and seeds' },
        { name: 'Dried Berries', description: 'Dried berries and fruits' },
        { name: 'Traditional Mixes', description: 'Traditional Indian dry fruit mixes' }
    ]
    const categories = await createEntities('productCategory', categoriesData, { createdBy: adminUser.id, updatedBy: adminUser.id })

    // Product brands
    const brandsData = [
        { name: 'Swaraj Premium', description: 'Premium quality brand' },
        { name: 'Kashmir Valley', description: 'Kashmir origin products' },
        { name: 'Royal Dry Fruits', description: 'Royal quality selection' },
        { name: 'Organic Harvest', description: 'Organic certified products' },
        { name: 'Traditional Taste', description: 'Traditional Indian taste' }
    ]
    const brands = await createEntities('productBrand', brandsData, { createdBy: adminUser.id, updatedBy: adminUser.id })

    // Products
    const productsData = [
        { name: 'Premium Almonds', sku: 'PF001', description: 'Premium quality California almonds', price: 1200, costPrice: 800, categoryId: 0, brandId: 0 },
        { name: 'Premium Cashews', sku: 'PF002', description: 'Premium whole cashews', price: 1400, costPrice: 950, categoryId: 0, brandId: 0 },
        { name: 'Regular Almonds', sku: 'RF001', description: 'Regular quality almonds', price: 800, costPrice: 550, categoryId: 1, brandId: 3 },
        // ... add other products here similarly
    ]
    const products = await Promise.all(productsData.map(p =>
        prisma.product.create({
            data: {
                ...p,
                categoryId: categories[p.categoryId].id,
                brandId: brands[p.brandId].id,
                createdBy: adminUser.id,
                updatedBy: adminUser.id
            }
        })
    ))

    // Stock
    await Promise.all(products.map(product =>
        prisma.stock.create({ data: { productId: product.id, quantity: Math.floor(Math.random() * 100) + 50, location: 'Main Warehouse', updatedAt: new Date() } })
    ))

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => await prisma.$disconnect())
