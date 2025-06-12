"use client"
import ProductCard from "../ProductCard";
import { Product } from "@/types/Product";
import { useRouter } from "next/navigation";

export default function ProductGrid(props: {
    products: Product[];
    onProductClick?: (productId: number, position: number) => void;
}) {
    const router = useRouter();

    const handleViewDetails = (productId: number, position?: number) => {
        // Track click if callback provided
        if (props.onProductClick && position !== undefined) {
            props.onProductClick(productId, position);
        }
        router.push(`/products/${productId}`);
    };

    const handleAddToCart = (product: Product) => {
        // This could be enhanced to integrate with actual cart functionality
        console.log(`Adding ${product.name} to cart`);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {props.products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    size="small"
                    onViewDetails={() => handleViewDetails(product.id, index)}
                    onAddToCart={() => handleAddToCart(product)}
                />
            ))}
        </div>
    );
}