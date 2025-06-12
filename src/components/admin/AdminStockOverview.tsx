"use client"
import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { 
    useStockItems, 
    useStockByProduct, 
    useValidateProductStock,
    useCreateStock,
    useUpdateStock
} from "@/hooks/useStock";
import { useProducts } from "@/hooks/useProducts";
import StockBadge from "@/components/StockBadge";
import { formatVND } from "@/utils/currency";
import { StockItem } from "@/types/Stock";
import { t } from "@/utils/localization";

export default function AdminStockOverview() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [showAddStock, setShowAddStock] = useState(false);
    
    const { data: stockItems, isLoading: stockLoading } = useStockItems({
        search: searchTerm,
        page: 0,
        size: 20
    });
    
    const { data: products, isLoading: productsLoading } = useProducts({
        page: 0,
        size: 100
    });

    const { data: selectedProductStock } = useStockByProduct(selectedProduct || 0);
    const validateStock = useValidateProductStock();

    const handleValidateStock = async (productId: number, quantity: number) => {
        try {
            const result = await validateStock.mutateAsync({ productId, quantity });
            alert(`Validation result: ${result.available ? 'Available' : 'Not available'}\nAvailable quantity: ${result.availableQuantity}`);
        } catch (error) {
            alert('Error validating stock');
        }
    };

    if (stockLoading || productsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading stock information...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('sections.stockManagement')}</h1>
                <Button
                    variant="filled"
                    label={t('stock.addStockItem')}
                    icon="add"
                    onClick={() => setShowAddStock(true)}
                />
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        label={t('actions.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('stock.searchPlaceholder')}
                    />
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('products.filterByProduct')}</label>
                        <select
                            value={selectedProduct || ""}
                            onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : null)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">{t('products.allProducts')}</option>
                            {products?.content?.map((product: any) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Stock Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockItems?.content?.map((stock: StockItem) => (
                    <Card key={stock.id} className="p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{stock.productName}</h3>
                                    <p className="text-sm text-gray-600">SKU: {stock.sku}</p>
                                    <p className="text-sm text-gray-600">Category: {stock.categoryName}</p>
                                </div>
                                <StockBadge 
                                    status={stock.status}
                                    quantity={stock.quantity}
                                    showQuantity={true}
                                    size="small"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-medium">Quantity:</span> {stock.quantity}
                                </div>
                                <div>
                                    <span className="font-medium">Low Stock:</span> {stock.lowStockThreshold}
                                </div>
                                <div>
                                    <span className="font-medium">Unit Cost:</span> {formatVND(stock.unitCost)}
                                </div>
                                <div>
                                    <span className="font-medium">Total Value:</span> {formatVND(stock.totalValue)}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    label={t('stock.testStock')}
                                    onClick={() => handleValidateStock(stock.productId, 1)}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    label={t('actions.edit')}
                                    icon="edit"
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* No results message */}
            {stockItems?.content?.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">{t('stock.noStockItems')}</p>
                </Card>
            )}

            {/* Stock Summary Stats */}
            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Stock Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stockItems?.content?.filter((s: StockItem) => s.status === 'IN_STOCK').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">In Stock</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {stockItems?.content?.filter((s: StockItem) => s.status === 'LOW_STOCK').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Low Stock</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {stockItems?.content?.filter((s: StockItem) => s.status === 'OUT_OF_STOCK').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Out of Stock</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {stockItems?.content?.reduce((sum: number, s: StockItem) => sum + s.totalValue, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Value (VND)</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
