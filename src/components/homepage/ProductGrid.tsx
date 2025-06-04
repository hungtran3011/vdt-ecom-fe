"use client"
import ProductCard from "../ProductCard"; // Ensure this path points to your custom ProductCard component
import { Product } from "@/types/Product";

export default function ProductGrid(props: {
    products: Product[];
}) {
    return (
        <div className="w-full grid grid-flow-row">
            {props.products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={() => fetch("/api/product/")}
                    onAddToCart={() => console.log(`Adding ${product.name} to cart`)}
                />
            ))}
        </div>
    );
}