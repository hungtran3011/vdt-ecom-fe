/**
 * Vietnamese localization constants
 * Contains all Vietnamese text used throughout the application
 */

export const VI_TRANSLATIONS = {
  // Common actions
  actions: {
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    add: 'Thêm',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    reset: 'Đặt lại',
    submit: 'Gửi',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước',
    confirm: 'Xác nhận',
    close: 'Đóng',
    view: 'Xem',
    viewDetails: 'Xem chi tiết',
    addToCart: 'Thêm vào giỏ hàng',
    buyNow: 'Mua ngay',
    checkout: 'Thanh toán',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    register: 'Đăng ký',
    update: 'Cập nhật',
    refresh: 'Làm mới',
    download: 'Tải xuống',
    upload: 'Tải lên',
    print: 'In',
    export: 'Xuất',
    import: 'Nhập',
    create: 'Tạo',
    sort: 'Sắp xếp',
    exportExcel: 'Xuất Excel',
    copy: 'Sao chép',
    paste: 'Dán',
    cut: 'Cắt',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    reload: 'Tải lại',
    clear: 'Xóa',
    select: 'Chọn',
    selectAll: 'Chọn tất cả',
    deselect: 'Bỏ chọn',
    removeFromCart: 'Xóa khỏi giỏ hàng',
    retry: 'Thử lại',
    adjust: 'Điều chỉnh',
    forgotPassword: 'Quên mật khẩu',
    changePassword: 'Đổi mật khẩu',
    updateProfile: 'Cập nhật hồ sơ',
    viewProfile: 'Xem hồ sơ',
    continue: 'Tiếp tục',
    finish: 'Hoàn thành',
    open: 'Mở',
    show: 'Hiển thị',
    hide: 'Ẩn',
    enable: 'Bật',
    disable: 'Tắt',
    activate: 'Kích hoạt',
    deactivate: 'Vô hiệu hóa',
    approve: 'Phê duyệt',
    reject: 'Từ chối',
    process: 'Xử lý',
    processing: 'Đang xử lý...',
    refund: 'Hoàn tiền',
  },

  // Navigation
  navigation: {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    categories: 'Danh mục',
    orders: 'Đơn hàng',
    myOrders: 'Đơn hàng của tôi',
    cart: 'Giỏ hàng',
    profile: 'Hồ sơ',
    notifications: 'Thông báo',
    settings: 'Cài đặt',
    help: 'Trợ giúp',
    contact: 'Liên hệ',
    about: 'Giới thiệu',
    admin: 'Quản trị',
    dashboard: 'Bảng điều khiển',
  },

  // Admin sections
  admin: {
    dashboard: 'Bảng điều khiển',
    products: 'Quản lý sản phẩm',
    categories: 'Quản lý danh mục',
    orders: 'Quản lý đơn hàng',
    payments: 'Quản lý thanh toán',
    stock: 'Quản lý kho',
    users: 'Quản lý người dùng',
    statistics: 'Thống kê',
    reports: 'Báo cáo',
    settings: 'Cài đặt hệ thống',
    managementPortal: 'Cổng quản trị',
    administrator: 'Quản trị viên',
    userInformation: 'Thông tin người dùng',
    username: 'Tên người dùng',
    roles: 'Vai trò',
  },

  // Product related
  product: {
    name: 'Tên sản phẩm',
    description: 'Mô tả',
    price: 'Giá',
    basePrice: 'Giá gốc',
    salePrice: 'Giá khuyến mãi',
    discount: 'Giảm giá',
    category: 'Danh mục',
    brand: 'Thương hiệu',
    sku: 'Mã sản phẩm',
    stock: 'Tồn kho',
    quantity: 'Số lượng',
    inStock: 'Còn hàng',
    outOfStock: 'Hết hàng',
    lowStock: 'Sắp hết hàng',
    availability: 'Tình trạng',
    rating: 'Đánh giá',
    reviews: 'Nhận xét',
    specifications: 'Thông số kỹ thuật',
    features: 'Tính năng',
    images: 'Hình ảnh',
    weight: 'Trọng lượng',
    dimensions: 'Kích thước',
    color: 'Màu sắc',
    size: 'Kích cỡ',
    material: 'Chất liệu',
    warranty: 'Bảo hành',
    origin: 'Xuất xứ',
    manufacturer: 'Nhà sản xuất',
  },

  // Order related
  order: {
    id: 'Mã đơn hàng',
    date: 'Ngày đặt',
    status: 'Trạng thái',
    total: 'Tổng tiền',
    subtotal: 'Tạm tính',
    shipping: 'Phí vận chuyển',
    tax: 'Thuế',
    discount: 'Giảm giá',
    customer: 'Khách hàng',
    address: 'Địa chỉ',
    phone: 'Số điện thoại',
    email: 'Email',
    note: 'Ghi chú',
    paymentMethod: 'Phương thức thanh toán',
    paymentStatus: 'Trạng thái thanh toán',
    shippingMethod: 'Phương thức vận chuyển',
    trackingNumber: 'Mã vận đơn',
    estimatedDelivery: 'Dự kiến giao hàng',
    items: 'Sản phẩm',
    quantity: 'Số lượng',
    unitPrice: 'Đơn giá',
    totalPrice: 'Thành tiền',
  },

  // Stock management
  stockMovement: {
    movement: 'Xuất nhập kho',
    adjustment: 'Điều chỉnh kho',
    incoming: 'Nhập kho',
    outgoing: 'Xuất kho',
    transfer: 'Chuyển kho',
    stocktaking: 'Kiểm kho',
    damaged: 'Hàng hỏng',
    expired: 'Hàng hết hạn',
    returned: 'Hàng trả lại',
    reserved: 'Hàng đặt trước',
    available: 'Hàng có sẵn',
    onHold: 'Tạm giữ',
    location: 'Vị trí',
    warehouse: 'Kho hàng',
    supplier: 'Nhà cung cấp',
    batch: 'Lô hàng',
    expiryDate: 'Ngày hết hạn',
    manufactureDate: 'Ngày sản xuất',
    costPrice: 'Giá vốn',
    retailPrice: 'Giá bán lẻ',
    wholesalePrice: 'Giá bán sỉ',
  },

  // Payment related
  payment: {
    method: 'Phương thức thanh toán',
    status: 'Trạng thái thanh toán',
    amount: 'Số tiền',
    date: 'Ngày thanh toán',
    reference: 'Mã tham chiếu',
    gateway: 'Cổng thanh toán',
    fee: 'Phí giao dịch',
    netAmount: 'Số tiền thực nhận',
    currency: 'Loại tiền',
    exchangeRate: 'Tỷ giá',
    cashOnDelivery: 'Thanh toán khi nhận hàng',
    creditCard: 'Thẻ tín dụng',
    totalPayments: 'Tổng số giao dịch',
    totalRevenue: 'Tổng doanh thu',
    searchPlaceholder: 'Tìm theo mã thanh toán, mã đơn hàng, hoặc người dùng...',
    paymentId: 'Mã thanh toán',
    processPayment: 'Xử lý thanh toán',
    processRefund: 'Xử lý hoàn tiền',
    refundAmount: 'Số tiền hoàn',
    refundReason: 'Lý do hoàn tiền',
    refundReasonPlaceholder: 'Lý do hoàn tiền (ít nhất 10 ký tự)',
  },

  // Status labels
  status: {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    pending: 'Đang chờ',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    failed: 'Thất bại',
    successful: 'Thành công',
    expired: 'Hết hạn',
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ',
    blocked: 'Bị chặn',
    verified: 'Đã xác minh',
    unverified: 'Chưa xác minh',
  },

  // Form fields
  form: {
    required: 'Bắt buộc',
    optional: 'Tùy chọn',
    placeholder: {
      search: 'Tìm kiếm...',
      name: 'Nhập tên...',
      email: 'Nhập email...',
      phone: 'Nhập số điện thoại...',
      address: 'Nhập địa chỉ...',
      description: 'Nhập mô tả...',
      note: 'Nhập ghi chú...',
      price: 'Nhập giá...',
      quantity: 'Nhập số lượng...',
    },
    validation: {
      required: 'Trường này là bắt buộc',
      email: 'Email không hợp lệ',
      phone: 'Số điện thoại không hợp lệ',
      minLength: 'Tối thiểu {min} ký tự',
      maxLength: 'Tối đa {max} ký tự',
      min: 'Giá trị tối thiểu là {min}',
      max: 'Giá trị tối đa là {max}',
      positive: 'Phải là số dương',
      nonNegative: 'Phải là số không âm',
      integer: 'Phải là số nguyên',
      decimal: 'Phải là số thập phân',
      currency: 'Định dạng tiền tệ không hợp lệ',
      url: 'URL không hợp lệ',
      date: 'Ngày không hợp lệ',
      error: 'Lỗi xác thực',
    },
    name: 'Tên',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    city: 'Thành phố',
    state: 'Tỉnh/Thành',
    country: 'Quốc gia',
    zipCode: 'Mã bưu điện',
    description: 'Mô tả',
    notes: 'Ghi chú',
    status: 'Trạng thái',
    type: 'Loại',
    category: 'Danh mục',
    title: 'Tiêu đề',
    content: 'Nội dung',
    image: 'Hình ảnh',
    file: 'Tệp tin',
    date: 'Ngày',
    time: 'Thời gian',
    dateTime: 'Ngày giờ',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    searchPlaceholder: 'Tìm kiếm thanh toán',
    allStatuses: 'Tất cả trạng thái',
    allMethods: 'Tất cả phương thức',
  },

  // Messages
  messages: {
    success: {
      created: 'Tạo thành công',
      updated: 'Cập nhật thành công',
      deleted: 'Xóa thành công',
      saved: 'Lưu thành công',
      uploaded: 'Tải lên thành công',
      sent: 'Gửi thành công',
      completed: 'Hoàn thành thành công',
      stockAdjustmentCompleted: 'Điều chỉnh kho hoàn thành thành công',
    },
    error: {
      general: 'Có lỗi xảy ra',
      network: 'Lỗi kết nối mạng',
      notFound: 'Không tìm thấy',
      unauthorized: 'Không có quyền truy cập',
      forbidden: 'Truy cập bị từ chối',
      validation: 'Dữ liệu không hợp lệ',
      serverError: 'Lỗi máy chủ',
      timeout: 'Hết thời gian chờ',
      fileSize: 'Kích thước file quá lớn',
      fileType: 'Loại file không được hỗ trợ',
    },
    confirmation: {
      delete: 'Bạn có chắc chắn muốn xóa?',
      cancel: 'Bạn có chắc chắn muốn hủy?',
      save: 'Bạn có muốn lưu thay đổi?',
      exit: 'Bạn có muốn thoát?',
      logout: 'Bạn có muốn đăng xuất?',
    },
    info: {
      loading: 'Đang tải...',
      saving: 'Đang lưu...',
      uploading: 'Đang tải lên...',
      processing: 'Đang xử lý...',
      noData: 'Không có dữ liệu',
      noPaymentsFound: 'Không tìm thấy thanh toán nào phù hợp',
      noPaymentsAvailable: 'Chưa có thanh toán nào',
    },
  },

  // Pagination
  pagination: {
    page: 'Trang',
    of: 'của',
    total: 'Tổng cộng',
    items: 'mục',
    itemsPerPage: 'Mục mỗi trang',
    first: 'Đầu tiên',
    last: 'Cuối cùng',
    next: 'Tiếp theo',
    previous: 'Trước',
    showing: 'Hiển thị',
    to: 'đến',
    results: 'kết quả',
    noResults: 'Không có kết quả',
  },

  // Date and time
  dateTime: {
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    thisWeek: 'Tuần này',
    lastWeek: 'Tuần trước',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
    thisYear: 'Năm này',
    lastYear: 'Năm ngoái',
    days: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
    daysShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    months: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    monthsShort: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  },

  // Units
  units: {
    currency: '₫',
    piece: 'cái',
    kilogram: 'kg',
    gram: 'g',
    liter: 'l',
    milliliter: 'ml',
    meter: 'm',
    centimeter: 'cm',
    millimeter: 'mm',
    inch: 'inch',
    foot: 'ft',
    percent: '%',
  },

  // Services
  services: {
    freeShipping: 'Miễn phí vận chuyển',
    fastDelivery: 'Giao hàng nhanh',
    warranty: 'Bảo hành',
    support247: 'Hỗ trợ 24/7',
    returnPolicy: 'Chính sách đổi trả',
    securePayment: 'Thanh toán an toàn',
  },

  // Search related
  search: {
    placeholder: 'Tìm kiếm sản phẩm...',
    hintedSearchText: 'Nhập từ khóa tìm kiếm...',
    noResults: 'Không tìm thấy kết quả',
    searchResults: 'Kết quả tìm kiếm',
    suggestions: 'Gợi ý tìm kiếm'
  },

  stats: {
    totalUsers: 'Tổng số người dùng',
    totalProducts: 'Tổng số sản phẩm',
    totalOrders: 'Tổng số đơn hàng',
    totalRevenue: 'Tổng doanh thu',
    totalStockValue: 'Giá trị tồn kho',
    lowStockAlerts: 'Cảnh báo tồn kho thấp',
    outOfStockItems: 'Sản phẩm hết hàng',
    pendingPayments: 'Thanh toán chờ xử lý',
    completedPayments: 'Thanh toán hoàn thành',
    refundedPayments: 'Thanh toán hoàn tiền',
    paymentVolume: 'Khối lượng thanh toán'
  },

  sections: {
    stockManagement: 'Quản lý kho hàng',
    paymentManagement: 'Quản lý thanh toán',
    ordersManagement: 'Quản lý đơn hàng',
    productsManagement: 'Quản lý sản phẩm',
    usersManagement: 'Quản lý người dùng',
    categoriesManagement: 'Quản lý danh mục'
  },

  // Stock management specific
  stock: {
    stockValue: 'Giá trị kho',
    lowStock: 'Tồn kho thấp',
    outOfStock: 'Hết hàng',
    stockAlerts: 'Cảnh báo kho',
    adjustStock: 'Điều chỉnh kho',
    searchProducts: 'Tìm sản phẩm',
    searchProductsPlaceholder: 'Tìm theo tên sản phẩm hoặc SKU...',
    stockStatus: 'Trạng thái kho',
    allItems: 'Tất cả sản phẩm',
    lowStockItems: 'Tồn kho thấp',
    outOfStockItems: 'Hết hàng',
    available: 'Có sẵn',
    reserved: 'Đã đặt trước',
    minLevel: 'Mức tối thiểu',
    category: 'Danh mục',
    value: 'Giá trị',
    current: 'Hiện tại',
    threshold: 'Ngưỡng',
    acknowledge: 'Xác nhận',
    adjustmentType: 'Loại điều chỉnh',
    quantity: 'Số lượng',
    reason: 'Lý do',
    reasonPlaceholder: 'Lý do điều chỉnh',
    currentStock: 'Tồn kho hiện tại',
    processing: 'Đang xử lý...',
    noStockData: 'Không thể tải dữ liệu kho',
    noStockItems: 'Không có sản phẩm kho nào',
    noStockItemsSearch: 'Không tìm thấy sản phẩm kho nào phù hợp',
    failedToLoad: 'Không thể tải dữ liệu kho',
    exportCSV: 'Xuất CSV',
    exportExcel: 'Xuất Excel',
    noItemSelected: 'Không có mục nào được chọn để điều chỉnh kho',
    cannotRemoveMoreThanAvailable: 'Không thể lấy ra nhiều hơn số lượng có sẵn',
    failedToAdjust: 'Không thể điều chỉnh kho'
  },

  // Orders management specific
  orders: {
    orderId: 'Mã đơn hàng',
    customer: 'Khách hàng',
    total: 'Tổng tiền',
    orderDate: 'Ngày đặt',
    paymentMethod: 'Phương thức thanh toán',
    paymentStatus: 'Trạng thái thanh toán',
    shippingAddress: 'Địa chỉ giao hàng',
    orderItems: 'Sản phẩm đặt hàng',
    updateStatus: 'Cập nhật trạng thái',
    orderDetails: 'Chi tiết đơn hàng',
    searchOrders: 'Tìm đơn hàng',
    searchOrdersPlaceholder: 'Tìm theo mã đơn hàng, khách hàng...',
    allStatuses: 'Tất cả trạng thái',
    allPaymentMethods: 'Tất cả phương thức',
    allPaymentStatuses: 'Tất cả trạng thái thanh toán',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    orderTotal: 'Tổng đơn hàng',
    customerInfo: 'Thông tin khách hàng',
    phone: 'Số điện thoại',
    notes: 'Ghi chú',
    items: 'sản phẩm',
    noOrdersFound: 'Không tìm thấy đơn hàng nào',
    noOrdersAvailable: 'Chưa có đơn hàng nào',
    failedToLoadOrders: 'Không thể tải danh sách đơn hàng'
  },

  // Products management specific
  products: {
    productName: 'Tên sản phẩm',
    productDescription: 'Mô tả sản phẩm',
    basePrice: 'Giá gốc',
    price: 'Giá',
    images: 'Hình ảnh',
    variations: 'Biến thể',
    addProduct: 'Thêm sản phẩm',
    editProduct: 'Chỉnh sửa sản phẩm',
    deleteProduct: 'Xóa sản phẩm',
    searchProducts: 'Tìm sản phẩm',
    searchProductsPlaceholder: 'Tìm theo tên sản phẩm...',
    allCategories: 'Tất cả danh mục',
    noProductsFound: 'Không tìm thấy sản phẩm nào',
    noProductsAvailable: 'Chưa có sản phẩm nào',
    failedToLoadProducts: 'Không thể tải danh sách sản phẩm',
    uploadImages: 'Tải lên hình ảnh',
    addVariation: 'Thêm biến thể',
    variationType: 'Loại biến thể',
    variationName: 'Tên biến thể',
    additionalPrice: 'Giá bổ sung',
    dynamicFields: 'Thuộc tính'
  },

  // Users management specific
  users: {
    userName: 'Tên người dùng',
    userEmail: 'Email người dùng',
    fullName: 'Họ và tên',
    role: 'Vai trò',
    status: 'Trạng thái',
    joinDate: 'Ngày tham gia',
    lastLogin: 'Lần đăng nhập cuối',
    addUser: 'Thêm người dùng',
    editUser: 'Chỉnh sửa người dùng',
    deleteUser: 'Xóa người dùng',
    searchUsers: 'Tìm người dùng',
    searchUsersPlaceholder: 'Tìm theo tên, email...',
    allRoles: 'Tất cả vai trò',
    admin: 'Quản trị viên',
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    noUsersFound: 'Không tìm thấy người dùng nào',
    noUsersAvailable: 'Chưa có người dùng nào',
    failedToLoadUsers: 'Không thể tải danh sách người dùng',
    userDetails: 'Chi tiết người dùng',
    permissions: 'Quyền hạn',
    accountSettings: 'Cài đặt tài khoản'
  },

  // Categories management specific
  categories: {
    categoryName: 'Tên danh mục',
    categoryDescription: 'Mô tả danh mục',
    categoryImage: 'Hình ảnh danh mục',
    productCount: 'Số lượng sản phẩm',
    addCategory: 'Thêm danh mục',
    editCategory: 'Chỉnh sửa danh mục',
    deleteCategory: 'Xóa danh mục',
    searchCategories: 'Tìm danh mục',
    searchCategoriesPlaceholder: 'Tìm theo tên danh mục...',
    noCategoriesFound: 'Không tìm thấy danh mục nào',
    noCategoriesAvailable: 'Chưa có danh mục nào',
    failedToLoadCategories: 'Không thể tải danh sách danh mục',
    categoryDetails: 'Chi tiết danh mục',
    dynamicFields: 'Trường động',
    fieldName: 'Tên trường',
    fieldType: 'Loại trường',
    appliesTo: 'Áp dụng cho',
    required: 'Bắt buộc',
    addField: 'Thêm trường'
  },
} as const;

/**
 * Get translation by key path
 * @param key - Dot notation key path (e.g., 'actions.save')
 * @returns Translated string or key if not found
 */
export const t = (key: string): string => {
  const keys = key.split('.');
  let value: unknown = VI_TRANSLATIONS;

  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
};

/**
 * Pluralize Vietnamese text based on count
 * Vietnamese doesn't have complex plural rules like English
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, uses singular if not provided)
 * @returns Appropriate form based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  // Vietnamese typically uses the same form for singular and plural
  // But we can add classifiers or context words
  if (count === 0) {
    return `không có ${singular}`;
  } else if (count === 1) {
    return `1 ${singular}`;
  } else {
    return `${count} ${plural || singular}`;
  }
};
