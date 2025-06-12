import { Metadata } from 'next';
import HomePageClient from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  title: 'VDT Store - Mua sắm trực tuyến chất lượng cao',
  description: 'Khám phá hàng ngàn sản phẩm chất lượng tại VDT Store. Mua sắm trực tuyến với giá tốt nhất, giao hàng nhanh chóng và dịch vụ khách hàng tuyệt vời.',
  openGraph: {
    title: 'VDT Store - Mua sắm trực tuyến chất lượng cao',
    description: 'Khám phá hàng ngàn sản phẩm chất lượng tại VDT Store. Mua sắm trực tuyến với giá tốt nhất, giao hàng nhanh chóng và dịch vụ khách hàng tuyệt vời.',
    type: 'website',
  },
};

/**
 * Homepage with proper SSR support
 * Client-side functionality is separated into HomePageClient component
 */
export default function Home() {
  return <HomePageClient />;
}
