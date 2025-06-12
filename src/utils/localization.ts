/**
 * Vietnamese localization constants
 * Contains all Vietnamese text used throughout the application
 * Organized by feature/module for better maintainability
 */

export const VI_TRANSLATIONS = {
  // Common translations used across the app
  common: {
    allMethods: "Tất cả phương thức",
    allStatuses: "Tất cả trạng thái",
    loading: 'Đang tải...',
    error: 'Đã xảy ra lỗi',
    success: 'Thành công',
    warning: 'Cảnh báo',
    info: 'Thông tin',
    noData: 'Không có dữ liệu',
    notFound: 'Không tìm thấy',
    unauthorized: 'Không có quyền truy cập',
    forbidden: 'Truy cập bị từ chối',
    serverError: 'Lỗi máy chủ',
    refresh: 'Làm mới',
    unknown: 'Không xác định',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    updating: 'Đang cập nhật...',
    status: 'Trạng thái',
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    enabled: 'Đã bật',
    disabled: 'Đã tắt',
    yes: 'Có',
    no: 'Không',
    optional: 'Tùy chọn',
    required: 'Bắt buộc',
    add: 'Thêm',
    delete: 'Xóa',
    cancel: 'Hủy',
    search: 'Tìm kiếm',
    searchProducts: 'Tìm kiếm sản phẩm',
    searchProductsPlaceholder: 'Nhập tên sản phẩm...'
  },

  // Common actions
  actions: {
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    add: 'Thêm',
    create: 'Tạo',
    update: 'Cập nhật',
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
    viewAll: 'Xem tất cả',
    viewDetails: 'Xem chi tiết',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    register: 'Đăng ký',
    refresh: 'Làm mới',
    download: 'Tải xuống',
    upload: 'Tải lên',
    print: 'In',
    export: 'Xuất',
    import: 'Nhập',
    sort: 'Sắp xếp',
    select: 'Chọn',
    selectAll: 'Chọn tất cả',
    selectMode: 'Chế độ chọn',
    deselect: 'Bỏ chọn',
    clear: 'Xóa',
    retry: 'Thử lại',
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
    addToCart: 'Thêm vào giỏ hàng',
    removeFromCart: 'Xóa khỏi giỏ hàng',
    buyNow: 'Mua ngay',
    checkout: 'Thanh toán',
    exportExcel: 'Xuất Excel',
  },

  // Pagination
  pagination: {
    pageSize: 'Kích thước trang',
    firstPage: 'Trang đầu',
    previousPage: 'Trang trước', 
    nextPage: 'Trang tiếp',
    lastPage: 'Trang cuối',
    showing: 'Đang hiện',
    "of": "trong",
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
    dashboard: 'Bảng điều khiển',
    management: 'Quản lý',
    reports: 'Báo cáo',
    analytics: 'Phân tích'
  },

  // Time and date
  time: {
    timeRange: 'Khoảng thời gian',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    last7Days: '7 ngày qua',
    last30Days: '30 ngày qua',
    last90Days: '90 ngày qua',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
    thisYear: 'Năm nay',
    lastYear: 'Năm trước',
    custom: 'Tùy chỉnh',
    from: 'Từ',
    to: 'Đến',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc'
  },

  // Form validation
  form: {
    validation: {
      required: 'Trường này là bắt buộc',
      email: 'Email không hợp lệ',
      minLength: 'Tối thiểu {{min}} ký tự',
      maxLength: 'Tối đa {{max}} ký tự',
      min: 'Giá trị tối thiểu là {{min}}',
      max: 'Giá trị tối đa là {{max}}',
      pattern: 'Định dạng không hợp lệ',
      number: 'Phải là số',
      integer: 'Phải là số nguyên',
      positive: 'Phải là số dương',
      error: 'Lỗi xác thực'
    },
    category: "Danh mục",
    searchPlaceholder: 'Tìm kiếm',
    allMethods: 'Tất cả phương thức',
    allStatuses: 'Tất cả trạng thái',
    status: 'Trạng thái',
  },

  // Admin sections
  sections: {
    dashboard: 'Bảng điều khiển',
    productsManagement: 'Quản lý sản phẩm',
    categoriesManagement: 'Quản lý danh mục',
    orderManagement: 'Quản lý đơn hàng',
    usersManagement: 'Quản lý người dùng',
    stockManagement: 'Quản lý kho hàng',
    paymentManagement: 'Quản lý thanh toán',
    reportManagement: 'Quản lý báo cáo'
  },

  // Admin navigation
  adminNavigation: {
    dashboard: 'Bảng điều khiển',
    products: 'Sản phẩm',
    categories: 'Danh mục',
    orders: 'Đơn hàng',
    users: 'Người dùng',
    payments: 'Thanh toán',
    stock: 'Kho hàng'
  },

  // Admin dashboard
  admin: {
    ordersManagement: 'Quản lý đơn hàng',
    dashboard: {
      title: 'Bảng điều khiển quản trị',
      systemStatus: 'Trạng thái hệ thống',
      lastUpdated: 'Cập nhật lần cuối',
      totalProducts: 'Tổng sản phẩm',
      activeProducts: 'Sản phẩm hoạt động',
      totalOrders: 'Tổng đơn hàng',
      pendingOrders: 'Đơn hàng chờ xử lý',
      totalRevenue: 'Tổng doanh thu',
      averageOrderValue: 'Giá trị đơn hàng trung bình',
      totalUsers: 'Tổng người dùng',
      activeUsers: 'Người dùng hoạt động',
      stockValue: 'Giá trị kho hàng',
      stockItems: 'Tổng sản phẩm kho',
      lowStockItems: 'Sản phẩm sắp hết hàng',
      criticalAlerts: 'Cảnh báo nghiêm trọng',
      paymentSuccess: 'Thanh toán thành công',
      totalPayments: 'Tổng thanh toán',
      soldCount: 'Số lượng bán',
      overview: 'Tổng quan',
      products: 'Sản phẩm',
      orders: 'Tổng đơn hàng',
      users: 'Người dùng',
      performance: 'Tổng quan hiệu suất',
      categories: 'Danh mục',
      averagePrice: 'Giá trung bình',
      addedToday: 'Đã thêm hôm nay',
      addedThisWeek: 'Đã thêm tuần này',
      addedThisMonth: 'Đã thêm tháng này',
    },
    managementPortal: 'Cổng quản lý',
    administrator: 'Quản trị viên',
    analytics: {
      totalOrders: 'Tổng đơn hàng',
      totalRevenue: 'Tổng doanh thu',
      pendingOrders: 'Đơn hàng chờ xử lý',
      completedOrders: 'Đơn hàng hoàn thành'
    },
    errors: {
      failedToLoadOrders: 'Không thể tải danh sách đơn hàng',
      noOrdersFound: 'Không tìm thấy đơn hàng phù hợp với bộ lọc của bạn',
      noOrdersAvailable: 'Chưa có đơn hàng nào'
    }
  },

  // Statistics
  stats: {
    totalProducts: 'Tổng sản phẩm',
    totalOrders: 'Tổng đơn hàng',
    totalUsers: 'Tổng người dùng',
    totalRevenue: 'Tổng doanh thu',
    averageOrderValue: 'Giá trị đơn hàng trung bình'
  },

  // Messages
  messages: {
    noPaymentsAvailable: 'Không có thanh toán nào',
    success: {
      productCreated: 'Sản phẩm đã được tạo thành công',
      productUpdated: 'Sản phẩm đã được cập nhật thành công',
      productDeleted: 'Sản phẩm đã được xóa thành công',
      categoryCreated: 'Danh mục đã được tạo thành công',
      categoryUpdated: 'Danh mục đã được cập nhật thành công',
      categoryDeleted: 'Danh mục đã được xóa thành công',
      orderUpdated: 'Đơn hàng đã được cập nhật thành công',
      orderStatusUpdated: 'Trạng thái đơn hàng đã được cập nhật thành công',
      stockAdjustmentCompleted: 'Điều chỉnh kho hoàn thành thành công',
      stockCreated: 'Mặt hàng kho đã được tạo thành công',
      alertAcknowledged: 'Cảnh báo đã được xác nhận',
      bulkUpdateCompleted: 'Cập nhật hàng loạt hoàn thành thành công',
      deleted: 'Đã xóa thành công',
      dataLoaded: 'Dữ liệu đã được tải thành công',
      dataExported: 'Dữ liệu đã được xuất thành công',
    },
    confirmation: {
      delete: "Bạn có chắc chắn muốn xóa mục này không?",
    },
    error: {
      general: 'Đã xảy ra lỗi, vui lòng thử lại sau',
      productCreationFailed: 'Không thể tạo sản phẩm',
      productUpdateFailed: 'Không thể cập nhật sản phẩm',
      productDeletionFailed: 'Không thể xóa sản phẩm',
      categoryCreationFailed: 'Không thể tạo danh mục',
      categoryUpdateFailed: 'Không thể cập nhật danh mục',
      categoryDeletionFailed: 'Không thể xóa danh mục',
      orderUpdateFailed: 'Không thể cập nhật đơn hàng',
      stockAdjustmentFailed: 'Không thể điều chỉnh kho',
      stockCreationFailed: 'Không thể tạo mặt hàng kho',
      alertAcknowledgeFailed: 'Không thể xác nhận cảnh báo',
      bulkUpdateFailed: 'Cập nhật hàng loạt thất bại',
      loadDataFailed: 'Không thể tải dữ liệu',
      networkError: 'Lỗi kết nối mạng',
      serverError: 'Lỗi máy chủ',
      unauthorizedAccess: 'Truy cập không được phép'
    },
    info: {
      noData: "Không có dữ liệu"
    }
  },

  // Stock Management - Comprehensive section
  stock: {
    // Main navigation and views
    dashboard: 'Bảng điều khiển kho',
    dashboardDescription: 'Tổng quan và quản lý tình trạng kho hàng',
    stockList: 'Danh sách kho',
    history: 'Lịch sử',
    bulkUpdate: 'Cập nhật loạt',
    management: 'Quản lý kho',
    
    // Views and filters
    view: 'Chế độ xem',
    overview: 'Tổng quan',
    alerts: 'Cảnh báo',
    movements: 'Biến động',
    recentMovements: 'Biến động gần đây',
    recentAlerts: 'Cảnh báo gần đây',
    lowStock: 'Tồn kho thấp',
    outOfStock: 'Hết hàng',
    
    // Stock status and values
    stockStatus: 'Trạng thái kho',
    stockValue: 'Giá trị kho',
    totalValue: 'Tổng giá trị',
    currentValue: 'Giá trị hiện tại',
    available: 'Có sẵn',
    reserved: 'Đã đặt trước',
    current: 'Hiện tại',
    currentStock: 'Tồn kho hiện tại',
    inStock: 'Còn hàng',
    outOfStockLabel: 'Hết hàng',
    lowStockLabel: 'Sắp hết hàng',
    stockSummary: 'sản phẩm • tổng giá trị',
    
    // Stock levels
    availableStock: 'Tồn kho có sẵn',
    reservedStock: 'Tồn kho đã đặt',
    minStockLevel: 'Mức tồn kho tối thiểu',
    maxStockLevel: 'Mức tồn kho tối đa',
    minLevel: 'Mức tối thiểu',
    threshold: 'Ngưỡng',
    
    // Stock items and categories
    stockItems: 'Mặt hàng kho',
    lowStockItems: 'Tồn kho thấp',
    outOfStockItems: 'Sản phẩm hết hàng',
    allItems: 'Tất cả sản phẩm',
    category: 'Danh mục',
    allCategories: 'Tất cả danh mục',
    
    // Stock operations
    adjustStock: 'Điều chỉnh kho',
    adjustmentType: 'Loại điều chỉnh',
    quantity: 'Số lượng',
    newQuantity: 'Số lượng mới',
    change: 'Thay đổi',
    reason: 'Lý do',
    reasonPlaceholder: 'Lý do điều chỉnh',
    updateReason: 'Lý do cập nhật',
    unitCost: 'Giá vốn',
    location: 'Vị trí',
    locationPlaceholder: 'Vị trí kho, khu vực...',
    notes: 'Ghi chú',
    notesPlaceholder: 'Ghi chú bổ sung...',
    warehouse: 'Kho',
    
    // Stock alerts
    stockAlerts: 'Cảnh báo kho',
    acknowledge: 'Xác nhận',
    alertAcknowledged: 'Đã xác nhận cảnh báo',
    failedToAcknowledgeAlert: 'Không thể xác nhận cảnh báo',
    noActiveAlerts: 'Không có cảnh báo nào',
    noLowStockItems: 'Không có sản phẩm nào sắp hết hàng',
    
    // Stock movements and history
    stockMovementHistory: 'Lịch sử biến động kho',
    productMovementHistory: 'Lịch sử biến động sản phẩm',
    viewDetailedMovementHistory: 'Xem chi tiết lịch sử biến động kho hàng',
    movementType: 'Loại biến động',
    movement: 'Biến động',
    allTypes: 'Tất cả loại',
    performedBy: 'Thực hiện bởi',
    stocktaking: 'Kiểm kho',
    
    // Search and filtering
    searchProducts: 'Tìm sản phẩm',
    searchProductsPlaceholder: 'Tìm theo tên sản phẩm hoặc SKU...',
    searchPlaceholder: 'Tìm theo tên sản phẩm hoặc SKU...',
    searchReference: 'Tìm tham chiếu',
    searchReferencePlaceholder: 'Tìm theo mã đơn hàng, mã tham chiếu...',
    startDate: 'Từ ngày',
    
    // Stock management specific
    addStockItem: 'Thêm mặt hàng kho',
    testStock: 'Kiểm tra kho',
    endDate: 'Đến ngày',
    
    // Add Stock Form
    addStockDescription: 'Thêm sản phẩm mới vào hệ thống quản lý kho',
    stockInfo: 'Thông tin kho',
    createStockItem: 'Tạo mặt hàng kho',
    creating: 'Đang tạo...',
    createSuccess: 'Tạo mặt hàng kho thành công',
    createError: 'Có lỗi xảy ra khi tạo mặt hàng kho',
    initialStock: 'Số lượng ban đầu',
    sku: 'Mã SKU',
    skuPlaceholder: 'Nhập mã SKU duy nhất...',
    lowStockThreshold: 'Ngưỡng tồn kho thấp',
    lowStockThresholdPlaceholder: 'Ngưỡng cảnh báo tồn kho thấp',
    variations: 'Biến thể',
    variationsPlaceholder: 'Chọn biến thể sản phẩm...',
    noVariations: 'Không có biến thể',
    selectVariationsDescription: 'Chọn và cấu hình các biến thể cho mặt hàng kho này',
    variationValues: 'Giá trị biến thể',
    variationValuesPlaceholder: 'Nhập các giá trị, phân cách bằng dấu phẩy (ví dụ: Đỏ, Xanh, Vàng)',
    variationValuesHint: 'Phân cách các giá trị bằng dấu phẩy. Ví dụ: Size S, Size M, Size L',
    
    // Bulk operations
    bulkStockUpdate: 'Cập nhật kho hàng loạt',
    bulkUpdateDescription: 'Cập nhật số lượng kho cho nhiều sản phẩm cùng lúc',
    selectAll: 'Chọn tất cả',
    selectNone: 'Bỏ chọn tất cả',
    selectedItems: 'Đã chọn',
    selectedItemsCount: 'Đã chọn {{count}} sản phẩm',
    hasChanges: 'Có thay đổi',
    hasUnsavedChanges: 'Có thay đổi chưa lưu',
    noChanges: 'Không có thay đổi',
    updating: 'Đang cập nhật...',
    updateSelected: 'Cập nhật đã chọn',
    useGlobalReason: 'Sử dụng lý do chung cho tất cả',
    globalUpdateReason: 'Lý do cập nhật chung',
    globalReasonPlaceholder: 'Nhập lý do cập nhật cho tất cả sản phẩm được chọn',
    bulkUpdateSuccess: 'Cập nhật kho hàng loạt thành công',
    bulkUpdateError: 'Có lỗi xảy ra khi cập nhật kho hàng loạt',
    
    // Export functionality
    exportCSV: 'Xuất CSV',
    exportExcel: 'Xuất Excel',
    
    // Error states
    processing: 'Đang xử lý...',
    noStockData: 'Không thể tải dữ liệu kho',
    noStockItems: 'Không có sản phẩm kho nào',
    noStockItemsSearch: 'Không tìm thấy sản phẩm kho nào phù hợp',
    noMovementHistory: 'Không có lịch sử biến động',
    failedToLoad: 'Không thể tải dữ liệu kho',
    failedToLoadHistory: 'Không thể tải lịch sử biến động',
    failedToAdjust: 'Không thể điều chỉnh kho',
    
    // Validation messages
    noItemSelected: 'Không có mục nào được chọn để điều chỉnh kho',
    noItemsSelected: 'Chưa chọn sản phẩm nào để cập nhật',
    cannotRemoveMoreThanAvailable: 'Không thể lấy ra nhiều hơn số lượng có sẵn',
    reasonRequiredForAllItems: 'Vui lòng nhập lý do cho tất cả sản phẩm được chọn',
    globalReasonRequired: 'Vui lòng nhập lý do chung',
    invalidAlertId: 'ID cảnh báo không hợp lệ',
    invalidExportFormat: 'Định dạng xuất không hợp lệ',
    alertAcknowledgedSuccessfully: 'Cảnh báo đã được xác nhận thành công',
    stockReportExported: 'Báo cáo kho đã được xuất thành công dưới định dạng',
    reference: 'Tham chiếu',
    referenceShort: 'Ref'
  },

  // Product Management
  products: {
    // Basic info
    name: 'Tên sản phẩm',
    productName: 'Tên sản phẩm',
    description: 'Mô tả sản phẩm',
    productDescription: 'Mô tả sản phẩm',
    basePrice: 'Giá gốc',
    price: 'Giá',
    category: 'Danh mục',
    selectCategory: 'Chọn danh mục',
    allProducts: 'Tất cả sản phẩm',
    filterByProduct: 'Lọc theo sản phẩm',
    selectProduct: 'Chọn sản phẩm',
    productInfo: 'Thông tin sản phẩm',
    
    // Images
    images: 'Hình ảnh',
    image: 'Hình ảnh',
    imageUrl: 'URL hình ảnh',
    addNewImage: 'Thêm hình ảnh mới',
    uploadImages: 'Tải lên hình ảnh',
    
    // Variations
    variations: 'Biến thể',
    variation: 'Biến thể',
    addVariation: 'Thêm biến thể',
    variationType: 'Loại biến thể',
    variationName: 'Tên biến thể',
    additionalPrice: 'Giá bổ sung',
    noVariations: 'Chưa có biến thể nào',
    
    // Dynamic fields
    dynamicFields: 'Thuộc tính',
    basicInfo: 'Thông tin cơ bản',
    detailsFor: 'Thông tin chi tiết cho',
    detailInfo: 'Thông tin chi tiết',
    noDynamicFields: 'Danh mục này không có trường thông tin bổ sung',
    selectCategoryFirst: 'Vui lòng chọn danh mục trước',
    
    // Actions
    addProduct: 'Thêm sản phẩm',
    addNew: 'Thêm sản phẩm',
    editProduct: 'Chỉnh sửa sản phẩm',
    updateProduct: 'Cập nhật sản phẩm',
    deleteProduct: 'Xóa sản phẩm',
    
    // Search and filter
    searchProducts: 'Tìm sản phẩm',
    searchProductsPlaceholder: 'Tìm theo tên sản phẩm...',
    allCategories: 'Tất cả danh mục',
    
    // States
    stock: 'Tồn kho',
    inStock: 'Còn hàng',
    outOfStock: 'Hết hàng',
    lowStock: 'Sắp hết hàng',
    
    // Messages
    updateSuccess: 'Sản phẩm đã được cập nhật thành công',
    updateError: 'Có lỗi xảy ra khi cập nhật sản phẩm',
    updating: 'Đang cập nhật...',
    createSuccess: 'Sản phẩm đã được tạo thành công',
    createError: 'Có lỗi xảy ra khi tạo sản phẩm',
    creating: 'Đang tạo...',
    
    // Error states
    noProductsFound: 'Không tìm thấy sản phẩm nào',
    noProductsAvailable: 'Chưa có sản phẩm nào',
    failedToLoadProducts: 'Không thể tải danh sách sản phẩm'
  },

  // Category Management
  categories: {
    categoryName: 'Tên danh mục',
    categoryDescription: 'Mô tả danh mục',
    categoryImage: 'Hình ảnh danh mục',
    productCount: 'sản phẩm',
    addCategory: 'Thêm danh mục',
    editCategory: 'Chỉnh sửa danh mục',
    deleteCategory: 'Xóa danh mục',
    searchCategories: 'Tìm danh mục',
    searchCategoriesPlaceholder: 'Tìm theo tên danh mục...',
    categoryNamePlaceholder: 'Nhập tên danh mục',
    categoryDescriptionPlaceholder: 'Mô tả danh mục này...',
    dynamicFieldPlaceholder: 'VD: Kích thước, Màu sắc, Chất liệu',
    description: 'Mô tả',
    uploadCategoryImage: 'Tải lên ảnh danh mục',
    addFirstField: 'Thêm trường đầu tiên',
    requiredField: 'Trường bắt buộc',
    noCategoriesAvailable: 'Chưa có danh mục nào',
    noCategoriesFound: 'Không tìm thấy danh mục nào',
    categoriesManagement: 'danh mục',
    updateCategory: 'Cập nhật danh mục',
    failedToLoadCategories: 'Không thể tải danh sách danh mục',
    categoryDetails: 'Chi tiết danh mục',
    dynamicFields: 'Trường động',
    fieldName: 'Tên trường',
    fieldType: 'Loại trường',
    appliesTo: 'Áp dụng cho',
    required: 'Bắt buộc',
    addField: 'Thêm trường',
    noDescription: 'Không có mô tả',
  },

  // Order Management
  orders: {
    orderId: 'Mã đơn hàng',
    order: 'Đơn hàng',
    customer: 'Khách hàng',
    total: 'Tổng tiền',
    orderDate: 'Ngày đặt',
    paymentMethod: 'Phương thức thanh toán',
    paymentStatus: 'Trạng thái thanh toán',
    shippingAddress: 'Địa chỉ giao hàng',
    address: 'Địa chỉ',
    orderItems: 'Sản phẩm đặt hàng',
    updateStatus: 'Cập nhật trạng thái',
    newStatus: 'Trạng thái mới',
    orderDetails: 'Chi tiết đơn hàng',
    details: 'Chi tiết',
    searchOrders: 'Tìm đơn hàng',
    searchOrdersPlaceholder: 'Tìm theo mã đơn hàng, khách hàng...',
    allStatuses: 'Tất cả trạng thái',
    allPaymentMethods: 'Tất cả phương thức',
    allPaymentStatuses: 'Tất cả trạng thái thanh toán',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    orderTotal: 'Tổng đơn hàng',
    customerInfo: 'Thông tin khách hàng',
    customerInformation: 'Thông tin khách hàng',
    orderInformation: 'Thông tin đơn hàng',
    paymentInformation: 'Thông tin thanh toán',
    totalOrders: "đơn hàng",
    phone: 'Số điện thoại',
    notes: 'Ghi chú',
    items: 'sản phẩm',
    quantity: 'Số lượng',
    created: 'Tạo lúc',
    updated: 'Cập nhật lúc',
    noOrdersFound: 'Không tìm thấy đơn hàng nào',
    noOrdersAvailable: 'Chưa có đơn hàng nào',
    failedToLoadOrders: 'Không thể tải danh sách đơn hàng',
    exportCSV: 'Xuất file CSV',
    exportExcel: 'Xuất file Excel',
    
    // User order statuses
    myOrders: 'Đơn hàng của tôi',
    all: 'Tất cả',
    pending: 'Chờ xử lý',
    processing: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    
    // Order status translations
    status: {
      PENDING_PAYMENT: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy',
      PAYMENT_FAILED: 'Thanh toán thất bại'
    },
    
    // Payment status translations
    paymentStatusLabels: {
      PENDING: 'Chờ thanh toán',
      SUCCESSFUL: 'Thành công',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền'
    }
  },

  // User Management
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

  search: {
    hintedSearchText: 'Tìm kiếm theo tên, mô tả...'
  },

  payment: {
    method: "Phương thức thanh toán",
    searchPlaceholder: "Tìm phương thức thanh toán",
  },

  // Homepage translations
  homepage: {
    // Hero section
    welcomeTitle: 'Chào mừng đến VDT Store',
    welcomeDescription: 'Mua sắm online dễ dàng, giao hàng nhanh chóng',
    promotionTitle: 'Khuyến mãi hấp dẫn',
    promotionDescription: 'Giảm giá lên đến 50% cho nhiều sản phẩm',
    qualityTitle: 'Sản phẩm chất lượng',
    qualityDescription: 'Đảm bảo nguồn gốc, chất lượng cao',
    
    // Search section
    searchPrompt: 'Hôm nay bạn muốn mua gì?',
    
    // Categories section
    popularCategories: 'Danh mục phổ biến',
    seeAllCategories: 'Xem tất cả',
    
    // Featured products section
    featuredProducts: 'Sản phẩm nổi bật',
    seeMoreProducts: 'Xem thêm',
    
    // Services section
    ourServices: 'Dịch vụ của chúng tôi',
    fastShipping: 'Giao hàng nhanh',
    fastShippingDescription: 'Giao hàng trong ngày, miễn phí với đơn hàng từ 200k',
    qualityGuarantee: 'Chất lượng đảm bảo',
    qualityGuaranteeDescription: 'Sản phẩm chính hãng, có tem chứng nhận chất lượng',
    support247: 'Hỗ trợ 24/7',
    support247Description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ'
  }
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
