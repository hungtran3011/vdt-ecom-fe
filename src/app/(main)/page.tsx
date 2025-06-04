import Carousel from "@/components/Carousel";
import Image from "next/image";
import Button from "@/components/Button";
import ProductGrid from "@/components/homepage/ProductGrid";
import { Product } from "@/types/Product";
import TextField from "@/components/TextField";
import CategoryButton from "@/components/homepage/CategoryButton";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Sản phẩm 1",
    description: "Mô tả sản phẩm 1",
    basePrice: 100000,
    images: ["/dummy/1.png"],
    categoryId: "1",
    dynamicValues: [],
    variations: [],
  },
  {
    id: "2",
    name: "Sản phẩm 2",
    description: "Mô tả sản phẩm 2",
    basePrice: 200000,
    images: ["/dummy/2.png"],
    categoryId: "2",
    dynamicValues: [],
    variations: [],
  },
  {
    id: "3",
    name: "Sản phẩm 3",
    description: "Mô tả sản phẩm 3",
    basePrice: 300000,
    images: ["/dummy/3.png"],
    categoryId: "3",
    dynamicValues: [],
    variations: [],
  },
];


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <Carousel>
          <div className="w-full h-[300px] relative">
            <Image
              src="/dummy/1.png"
              alt="Next.js logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full h-[300px] relative">
            <Image
              src="/dummy/2.png"
              alt="Geist logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="w-full h-[300px] relative">
            <Image
              src="/dummy/3.png"
              alt="Tailwind CSS logo"
              fill
              className="object-contain"
            />
          </div>
        </Carousel>
        <div className="w-full flex flex-col items-center gap-6">
          <div className="w-full text-center text-black text-3xl font-medium leading-[1.2]">
            Hôm nay bạn muốn mua gì?
          </div>
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { label: "Rau củ quả" },
              { label: "Hải sản" },
              { label: "Sữa bơ các loại" },
              { label: "Gạo - bột - đồ khô" },
              { label: "Mì ăn liền" },
              { label: "Bún - Miến - Phở" },
              { label: "Đồ ăn chế biến sẵn" },
              { label: "Mỹ phẩm" },
              { label: "Đồ gia dụng" },
              { label: "Điện thoại" },
              { label: "Máy tính - Laptop" },
              { label: "Thịt" },
              { label: "Trứng" },
              { label: "Dầu ăn - gia vị" },
              { label: "Thực phẩm chức năng" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 bg-white rounded-lg p-4 shadow hover:shadow-md transition"
              >
                <div className="w-24 h-24 bg-(--md-sys-secondary-container) rounded-full flex items-center justify-center mb-2">
                  <img
                    className="w-12 h-12 object-contain"
                    src="https://placehold.co/64x64"
                    alt={item.label}
                  />
                </div>
                <div className="text-center text-black text-base font-medium leading-relaxed">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <CategoryButton href="/categories" />
        </div>
        <div className="w-full text-center text-black text-3xl font-medium leading-[1.2]">
          Sản phẩm nổi bật
        </div>
        <ProductGrid
          products={mockProducts}
        />
        <TextField 
          variant="filled" 
          supportingText="Hiiiii"
          leadingIcon="search"
          trailingIcon="close"
          />
      </main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
