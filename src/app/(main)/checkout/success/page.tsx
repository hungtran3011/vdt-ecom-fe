'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

const CheckoutSuccessPage = () => {
  // Generate a mock order ID
  const orderId = `VDT${Date.now().toString().slice(-8)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-12">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl text-green-600">✓</span>
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
          </p>
          
          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-sm font-medium text-gray-500">Mã đơn hàng:</span>
                <div className="text-lg font-semibold text-gray-900">#{orderId}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Ngày đặt hàng:</span>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước tiếp theo:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Chúng tôi sẽ gửi email xác nhận đơn hàng cho bạn
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Đơn hàng sẽ được chuẩn bị và đóng gói trong 1-2 ngày làm việc
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Bạn sẽ nhận được thông báo khi đơn hàng được giao
              </li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="flex-1 sm:flex-none">
              <Button 
                variant="filled" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Xem đơn hàng
              </Button>
            </Link>
            <Link href="/categories" className="flex-1 sm:flex-none">
              <Button 
                variant="outlined" 
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
              >
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
          
          {/* Support Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Cần hỗ trợ?</h4>
            <p className="text-sm text-blue-700 mb-2">
              Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="text-sm text-blue-700">
              <div>📧 Email: support@vdt-ecom.com</div>
              <div>📞 Hotline: 1900-1234</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
