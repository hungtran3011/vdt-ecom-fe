import { Metadata } from 'next';
import SearchPageClient from '@/components/search/SearchPageClient';

export const metadata: Metadata = {
  title: 'Tìm kiếm sản phẩm - VDT Store',
  description: 'Tìm kiếm và khám phá hàng ngàn sản phẩm chất lượng tại VDT Store với công cụ tìm kiếm thông minh và bộ lọc chi tiết.',
  openGraph: {
    title: 'Tìm kiếm sản phẩm - VDT Store',
    description: 'Tìm kiếm và khám phá hàng ngàn sản phẩm chất lượng tại VDT Store với công cụ tìm kiếm thông minh và bộ lọc chi tiết.',
    type: 'website',
  },
};

export default function SearchPage() {
  return <SearchPageClient />;
}
