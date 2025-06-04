import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/Category';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    imageUrl: 'https://placehold.co/600x400/png',
    dynamicFields: []
  },
  {
    id: '2',
    name: 'Clothing',
    imageUrl: 'https://placehold.co/600x400/png',
    dynamicFields: []
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    imageUrl: 'https://placehold.co/600x400/png',
    dynamicFields: []
  },
  {
    id: '4',
    name: 'Books',
    imageUrl: 'https://placehold.co/600x400/png',
    dynamicFields: []
  },
];

const CategoriesPage = async () => {
  // Use mock categories
  const categories: Category[] = mockCategories;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Shop by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link href={`/products?category=${category.id}`} key={category.id} className="block">
            <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img src={category.imageUrl} alt={category.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{category.name}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// No need to fetch categories
async function fetchCategories(): Promise<Category[]> {
  return mockCategories;
}

export default CategoriesPage;