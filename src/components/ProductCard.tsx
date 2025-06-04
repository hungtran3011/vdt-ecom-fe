"use client"
import { HTMLAttributes } from "react";
import Button from "./Button";
import { Product } from "@/types/Product";

type ProductCardProps = {
    product: Product;
    onViewDetails: () => void;
    onAddToCart: () => void;
} & Partial<HTMLAttributes<HTMLDivElement>>;

export default function ProductCard({ product, onViewDetails, onAddToCart, ...htmlProps }: ProductCardProps) {
    return (
        <div className="w-full max-w-[320px] px-4 pb-4 bg-white rounded-2xl flex flex-col justify-start items-center gap-2.5 overflow-hidden shadow-lg" {...htmlProps}>
            <div className="w-full aspect-square bg-white flex flex-col justify-center items-center gap-2.5 overflow-hidden p-2">
                <img 
                    className="w-full h-auto object-contain max-h-[200px]" 
                    src={product.images && product.images[0]} 
                    alt={product.name}
                />
            </div>
            <div className="self-stretch min-h-[4rem] pb-2 flex flex-col justify-between items-center">
                <div className="self-stretch text-center justify-center text-black text-[1rem] font-medium leading-tight line-clamp-2">
                    {product.name}
                </div>
                <div className="w-full text-center justify-center text-Schemes-Primary text-[1rem] font-medium mt-2">
                    {product.basePrice.toFixed(2)}đ
                </div>
            </div>
            <div className="self-stretch flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
                <Button variant="tonal" onClick={onViewDetails} className="w-full rounded-xl hover:rounded-l-full hover:rounded-r-xl duration-200 ease-[cubic-bezier(0.05,0.7,0.1,1.0)] sm:flex-1">Xem thông tin</Button>
                <Button variant="filled" onClick={onAddToCart} className="w-full rounded-xl hover:rounded-r-full duration-200 ease-[cubic-bezier(0.05,0.7,0.1,1.0)]  sm:flex-1">Thêm vào giỏ hàng</Button>
            </div>
        </div>
    )
}