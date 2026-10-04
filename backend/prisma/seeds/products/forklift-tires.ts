import { ContentStatus, Prisma, ProductType } from '@prisma/client';

type JsonRecord = Prisma.InputJsonObject;

export interface ForkliftTireProductSeed {
  id: string;
  sku: string;
  name: string;
  slug: string;
  type: ProductType;
  categoryId: string;
  size: string | null;
  brand: string | null;
  tireType: string;
  rimType: string | null;
  condition: string;
  importPrice: number;
  sellingPrice: number | null;
  minStock: number;
  maxStock: number;
  imageUrl: string | null;
  shortDescription: string;
  description: string;
  highlights: string[];
  specifications: Array<{ label: string; value: string }>;
  applications: string[];
  seo: JsonRecord;
  tags: string[];
  status: ContentStatus;
}

const draft = ContentStatus.PUBLISHED;
const unknownSizeNote = 'Cần đối chiếu kích thước lốp, mâm và xe thực tế trước khi lắp đặt.';

export const forkliftTireProducts: ForkliftTireProductSeed[] = [
  {
    id: 'product-tire-nexen-600-9-warehouse', sku: 'SEED-NEXEN-600-9', name: 'Lốp đặc Nexen 6.00-9 cho kho xưởng', slug: 'lop-dac-nexen-6-00-9-cho-kho-xuong', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'NEXEN', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 1850000, minStock: 5, maxStock: 40, imageUrl: null,
    shortDescription: 'Lựa chọn lốp đặc cho xe nâng vận hành trong kho, nơi cần giảm thời gian dừng máy để xử lý tình trạng xì hoặc thủng lốp.',
    description: 'Sản phẩm hướng đến xe nâng làm việc theo ca trong kho và nhà xưởng có nền tương đối bằng phẳng. Lốp đặc không sử dụng hơi nên phù hợp khi đội vận hành muốn hạn chế các sự cố liên quan đến áp suất lốp. Trước khi thay, nên đối chiếu ký hiệu 6.00-9 trên lốp cũ, kiểu mâm gài và tình trạng mâm. Việc kiểm tra cả hai bánh cùng trục giúp xác định có cần thay theo cặp hay không. Sau khi lắp, hãy theo dõi hiện tượng rung, lệch lái hoặc mòn không đều để sớm kiểm tra lại mâm và hệ thống lái.',
    highlights: ['Phù hợp nhịp vận hành trong kho', 'Không cần kiểm tra áp suất định kỳ', 'Ưu tiên đối chiếu mâm gài trước khi ép lốp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }, { label: 'Lưu ý lắp đặt', value: 'Kiểm tra kiểu mâm CLICK thực tế' }], applications: ['Kho hàng', 'Nhà xưởng', 'Khu đóng gói'],
    seo: { title: 'Lốp đặc Nexen 6.00-9 cho kho xưởng', description: 'Tham khảo lốp đặc Nexen 6.00-9 cho xe nâng chạy trong kho. Kiểm tra kiểu mâm và kích thước thực tế trước khi lắp.', keywords: ['lốp đặc Nexen', 'lốp xe nâng 6.00-9', 'lốp xe nâng kho xưởng'] }, tags: ['lốp đặc xe nâng', 'NEXEN', '6.00-9', 'kho xưởng'], status: draft,
  },
  {
    id: 'product-tire-phoenix-600-9-sharp-floor', sku: 'SEED-PHOENIX-600-9', name: 'Lốp đặc Phoenix 6.00-9 cho nền nhiều vật sắc', slug: 'lop-dac-phoenix-6-00-9-cho-nen-nhieu-vat-sac', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'PHOENIX', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 2100000, minStock: 5, maxStock: 35, imageUrl: null,
    shortDescription: 'Lốp đặc tham khảo cho khu vực có phế liệu, mạt kim loại hoặc vật nhỏ trên mặt sàn, nơi người dùng cần giảm rủi ro xì lốp.',
    description: 'Trong xưởng cơ khí hoặc khu phân loại vật liệu, mặt sàn có thể xuất hiện mạt kim loại và vật nhỏ khó quan sát. Một bộ lốp đặc giúp đội xe tránh phụ thuộc vào áp suất khí, nhưng không thay thế việc vệ sinh lối đi và kiểm tra bánh xe định kỳ. Mẫu 6.00-9 này nên được đối chiếu với thông số trên hông lốp hiện hữu và kiểu mâm đang dùng. Khi tháo bánh cũ, cần quan sát phần mâm tiếp xúc với lốp, bu-lông và dấu hiệu biến dạng. Nếu xe thường xuyên đi qua mép sàn hoặc gờ chuyển khu vực, hãy thông báo điều kiện đó khi đặt hàng để được kiểm tra tính phù hợp.',
    highlights: ['Góc chọn lốp cho xưởng cơ khí', 'Không phụ thuộc áp suất hơi', 'Khuyến nghị kiểm tra mâm trước khi ép'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }], applications: ['Xưởng cơ khí', 'Khu phân loại vật liệu', 'Bãi gia công'],
    seo: { title: 'Lốp đặc Phoenix 6.00-9 cho xưởng cơ khí', description: 'Lốp đặc Phoenix 6.00-9 tham khảo cho xe nâng hoạt động ở xưởng có vật nhỏ trên sàn. Cần kiểm tra mâm và kích thước trước khi lắp.', keywords: ['lốp đặc Phoenix', 'vỏ xe nâng 6.00-9', 'lốp xe nâng xưởng cơ khí'] }, tags: ['PHOENIX', 'lốp đặc', '6.00-9', 'xưởng cơ khí'], status: draft,
  },
  {
    id: 'product-tire-komachi-600-9-shift', sku: 'SEED-KOMACHI-600-9', name: 'Lốp đặc Komachi 6.00-9 cho xe nâng chạy ca', slug: 'lop-dac-komachi-6-00-9-cho-xe-nang-chay-ca', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'KOMACHI', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 1950000, minStock: 5, maxStock: 35, imageUrl: null,
    shortDescription: 'Phương án thay thế cho xe nâng vận hành lặp lại theo ca, cần ghi nhận tình trạng bánh xe và kế hoạch thay lốp chủ động.',
    description: 'Với xe nâng chạy nhiều lượt trong ngày, thời điểm thay lốp nên dựa trên quan sát thực tế thay vì chờ đến khi xe rung mạnh hoặc lái nặng. Lốp đặc Komachi 6.00-9 được đưa vào catalog với mục đích hỗ trợ nhu cầu thay thế theo kế hoạch. Người phụ trách nên chụp lại ký hiệu lốp cũ, mặt trong mâm và vị trí bánh trước hoặc sau trước khi yêu cầu báo giá. Khi lắp xong, hãy ghi nhận ngày thay, vị trí bánh và hiện trạng nền làm việc để tiện theo dõi mòn không đều. Đây là dữ liệu hữu ích khi bố trí lịch đảo lốp hoặc kiểm tra hệ thống lái.',
    highlights: ['Phù hợp lập kế hoạch thay lốp', 'Dễ đối chiếu theo ký hiệu lốp cũ', 'Nên ghi nhận vị trí bánh sau lắp đặt'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }], applications: ['Kho vận hành theo ca', 'Trung tâm phân phối', 'Nhà máy'],
    seo: { title: 'Lốp đặc Komachi 6.00-9 cho xe chạy ca', description: 'Tham khảo lốp đặc Komachi 6.00-9 cho xe nâng hoạt động theo ca. Ghi nhận kích thước và vị trí bánh để lên kế hoạch thay hợp lý.', keywords: ['lốp Komachi 6.00-9', 'lốp xe nâng chạy ca', 'vỏ đặc xe nâng'] }, tags: ['KOMACHI', 'lốp xe nâng', '6.00-9', 'vận hành theo ca'], status: draft,
  },
  {
    id: 'product-tire-solitech-500-8-clean-floor', sku: 'SEED-SOLITECH-500-8', name: 'Lốp đặc Solitech 5.00-8 cho nền sạch', slug: 'lop-dac-solitech-5-00-8-cho-nen-sach', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '5.00-8', brand: 'SOLITECH', tireType: 'NON_MARKING', rimType: 'STANDARD', condition: 'NEW_100', importPrice: 0, sellingPrice: 2350000, minStock: 4, maxStock: 25, imageUrl: null,
    shortDescription: 'Lốp không để lại vệt dành cho khu vực cần kiểm soát dấu bánh trên nền, với điều kiện cần xác nhận đúng kích thước và loại mâm.',
    description: 'Các khu vực có nền sáng, khu đóng gói hoặc không gian cần giữ bề mặt sạch thường quan tâm đến việc hạn chế vệt bánh xe. Catalog ghi nhận mẫu lốp đặc không để lại vệt 5.00-8 như một lựa chọn cần được kiểm tra tương thích trước khi lắp. Không nên chỉ dựa vào đường kính nhìn bằng mắt; hãy đọc toàn bộ ký hiệu trên lốp hiện hữu và kiểm tra kiểu mâm. Đồng thời, hãy xem lại lộ trình xe, độ dốc và vị trí quay đầu vì đây là các yếu tố ảnh hưởng đến hiện tượng mòn. Nếu thay một bánh, cần đánh giá độ chênh lệch với bánh còn lại trên cùng trục.',
    highlights: ['Góc chọn lốp cho nền cần giữ sạch', 'Kiểu lốp không để lại vệt', 'Cần kiểm tra bánh cùng trục'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '5.00-8' }, { label: 'Kiểu lốp', value: 'Lốp đặc không để lại vệt' }], applications: ['Khu đóng gói', 'Kho nền sáng', 'Khu vực yêu cầu vệ sinh'],
    seo: { title: 'Lốp đặc Solitech 5.00-8 cho nền sạch', description: 'Lốp đặc Solitech 5.00-8 không để lại vệt, phù hợp khu vực cần giữ nền sạch. Đối chiếu ký hiệu lốp và loại mâm trước khi thay.', keywords: ['lốp Solitech 5.00-8', 'lốp xe nâng không để lại vệt', 'bánh xe nâng nền sạch'] }, tags: ['SOLITECH', '5.00-8', 'non marking', 'nền sạch'], status: draft,
  },
  {
    id: 'product-tire-dunlop-700-12-outdoor', sku: 'SEED-DUNLOP-700-12', name: 'Lốp hơi Dunlop 7.00-12 cho bãi ngoài trời', slug: 'lop-hoi-dunlop-7-00-12-cho-bai-ngoai-troi', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '7.00-12', brand: 'DUNLOP', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'USED', importPrice: 0, sellingPrice: 2250000, minStock: 5, maxStock: 35, imageUrl: null,
    shortDescription: 'Lốp hơi tham khảo cho xe nâng di chuyển ở bãi ngoài trời, khu vực có mặt nền không đồng đều và cần kiểm tra áp suất định kỳ.',
    description: 'Xe nâng làm việc ngoài trời thường gặp bề mặt nối, nền bê tông cũ hoặc đường nội bộ có độ gồ ghề khác nhau. Lốp hơi Dunlop 7.00-12 được đưa vào nhóm sản phẩm cho nhu cầu này, với lưu ý người dùng cần có quy trình kiểm tra áp suất và quan sát hông lốp. Trước khi thay, hãy xác định kiểu mâm LIP đang sử dụng, tình trạng van và bề mặt tiếp xúc giữa mâm với lốp. Không nên tiếp tục vận hành nếu thấy lốp mất áp bất thường hoặc hông lốp có dấu hiệu tổn thương. Cần xác nhận điều kiện vận hành thực tế với kỹ thuật viên trước khi chọn phương án thay lốp.',
    highlights: ['Hướng đến bãi ngoài trời', 'Cần duy trì kiểm tra áp suất', 'Đối chiếu kiểu mâm LIP và van lốp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Kiểu lốp', value: 'Lốp hơi' }, { label: 'Lưu ý', value: 'Kiểm tra áp suất theo quy trình vận hành' }], applications: ['Bãi ngoài trời', 'Khu giao nhận', 'Đường nội bộ nhà máy'],
    seo: { title: 'Lốp hơi Dunlop 7.00-12 cho bãi ngoài trời', description: 'Tham khảo lốp hơi Dunlop 7.00-12 cho xe nâng chạy bãi. Kiểm tra mâm LIP, van lốp và áp suất phù hợp trước khi vận hành.', keywords: ['lốp hơi Dunlop', 'lốp xe nâng 7.00-12', 'vỏ xe nâng ngoài trời'] }, tags: ['DUNLOP', 'lốp hơi', '7.00-12', 'bãi ngoài trời'], status: draft,
  },
  {
    id: 'product-tire-yokohama-700-12-yard', sku: 'SEED-YOKOHAMA-700-12', name: 'Lốp hơi Yokohama 7.00-12 cho khu giao nhận', slug: 'lop-hoi-yokohama-7-00-12-cho-khu-giao-nhan', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '7.00-12', brand: 'YOKOHAMA', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'NEW_100', importPrice: 0, sellingPrice: 2480000, minStock: 5, maxStock: 35, imageUrl: null,
    shortDescription: 'Mẫu lốp hơi theo hướng sử dụng tại khu nhận hàng, nơi xe nâng thường di chuyển giữa kho, ram dốc và sân bãi.',
    description: 'Khu giao nhận thường có nhiều điểm chuyển tiếp từ nền kho sang sân bãi và có mật độ xe di chuyển cao. Khi lựa chọn lốp hơi Yokohama 7.00-12, cần xem lại lộ trình chính của xe, nguy cơ cán vật lạ và tần suất kiểm tra áp suất hiện có. Thông số kích thước chỉ là điểm bắt đầu; kiểu mâm, van và bánh trước hoặc sau cũng cần được xác nhận. Nếu xe có dấu hiệu kéo lệch, rung ở tốc độ thấp hoặc mòn lệch, nên kiểm tra nguyên nhân cơ khí trước khi thay lốp mới. Việc lắp đúng lốp nhưng bỏ qua mâm hoặc hệ thống lái có thể làm vấn đề tái diễn.',
    highlights: ['Phù hợp bối cảnh giao nhận hàng', 'Theo dõi đường chuyển tiếp nền kho và sân', 'Kiểm tra nguyên nhân mòn lệch trước khi thay'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Kiểu lốp', value: 'Lốp hơi' }], applications: ['Khu giao nhận', 'Ram dốc', 'Sân kho'],
    seo: { title: 'Lốp hơi Yokohama 7.00-12 cho xe nâng bãi', description: 'Lốp hơi Yokohama 7.00-12 cho xe nâng di chuyển giữa kho và sân bãi. Hãy kiểm tra kiểu mâm, van và hiện trạng bánh trước khi lắp.', keywords: ['lốp Yokohama 7.00-12', 'lốp hơi xe nâng', 'bánh xe nâng khu giao nhận'] }, tags: ['YOKOHAMA', '7.00-12', 'lốp hơi', 'khu giao nhận'], status: draft,
  },
  {
    id: 'product-tire-tiron-700-12-replacement', sku: 'SEED-TIRON-700-12', name: 'Lốp hơi Tiron 7.00-12 thay thế theo kích thước', slug: 'lop-hoi-tiron-7-00-12-thay-theo-kich-thuoc', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '7.00-12', brand: 'TIRON', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'NEW_100', importPrice: 0, sellingPrice: 2050000, minStock: 5, maxStock: 30, imageUrl: null,
    shortDescription: 'Lựa chọn cho khách đang tìm lốp thay thế theo kích thước 7.00-12, cần chuẩn bị ảnh hông lốp và thông tin mâm để đối chiếu.',
    description: 'Khi tìm lốp thay thế, ký hiệu trên hông lốp là thông tin hữu ích nhất để bắt đầu nhưng chưa đủ để kết luận khả năng lắp đặt. Mẫu Tiron 7.00-12 phục vụ nhu cầu đối chiếu theo kích thước, đặc biệt khi khách cần thay lốp đã mòn hoặc bị hư hỏng. Hãy cung cấp ảnh mặt hông lốp cũ, ảnh mâm và vị trí bánh trên xe. Thông tin này giúp hạn chế nhầm lẫn giữa các cấu hình mâm. Sau lắp đặt, cần kiểm tra lại độ kín của van, hướng quay của gai lốp nếu có quy ước và áp suất theo khuyến nghị kỹ thuật của xe.',
    highlights: ['Tập trung vào nhu cầu thay thế theo size', 'Nên gửi ảnh lốp cũ và mâm', 'Kiểm tra van sau khi lắp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Kiểu lốp', value: 'Lốp hơi' }], applications: ['Thay lốp theo kích thước', 'Xe nâng vận hành hỗn hợp', 'Bảo trì định kỳ'],
    seo: { title: 'Lốp hơi Tiron 7.00-12 thay thế cho xe nâng', description: 'Tìm lốp hơi Tiron 7.00-12 để thay thế? Hãy đối chiếu ký hiệu lốp cũ, ảnh mâm và vị trí bánh trước khi lựa chọn.', keywords: ['lốp Tiron 7.00-12', 'thay lốp xe nâng', 'vỏ hơi xe nâng'] }, tags: ['TIRON', '7.00-12', 'thay thế lốp', 'lốp hơi'], status: draft,
  },
  {
    id: 'product-tire-masai-600-9-indoor', sku: 'SEED-MASAI-600-9', name: 'Lốp đặc Masai 6.00-9 cho lối đi trong nhà', slug: 'lop-dac-masai-6-00-9-cho-loi-di-trong-nha', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'MASAI', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 1780000, minStock: 5, maxStock: 35, imageUrl: null,
    shortDescription: 'Mẫu lốp đặc dùng để tham khảo cho xe nâng di chuyển nhiều trong nhà, qua lối đi hẹp và khu vực lấy hàng cố định.',
    description: 'Xe nâng di chuyển liên tục trong lối đi kho thường có nhiều thao tác quay đầu và dừng lấy hàng. Lốp đặc Masai 6.00-9 được phân loại theo bối cảnh này để khách dễ so sánh với tình trạng xe hiện tại. Trước khi lắp, cần kiểm tra độ mòn của hai bánh cùng trục và các vết cọ sát trên hông lốp cũ. Những dấu hiệu này có thể phản ánh khoảng hở, tải hàng hoặc thói quen đánh lái. Đối chiếu kích thước 6.00-9 và loại mâm thực tế là bước bắt buộc. Sau khi ép lốp, nên chạy thử không tải ở tốc độ thấp để kiểm tra độ ổn định.',
    highlights: ['Dành cho lộ trình trong nhà', 'Hỗ trợ kiểm tra mòn hai bánh cùng trục', 'Nên chạy thử sau khi lắp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }], applications: ['Lối đi kho', 'Khu lấy hàng', 'Nhà máy sản xuất'],
    seo: { title: 'Lốp đặc Masai 6.00-9 cho xe nâng trong nhà', description: 'Lốp đặc Masai 6.00-9 cho xe nâng di chuyển trong kho. Kiểm tra độ mòn hai bánh cùng trục và kiểu mâm trước khi ép lốp.', keywords: ['lốp Masai 6.00-9', 'lốp xe nâng trong nhà', 'lốp đặc kho hàng'] }, tags: ['MASAI', '6.00-9', 'lốp đặc', 'kho trong nhà'], status: draft,
  },
  {
    id: 'product-tire-success-600-9-maintenance', sku: 'SEED-SUCCESS-600-9', name: 'Lốp đặc Success 6.00-9 cho bảo trì định kỳ', slug: 'lop-dac-success-6-00-9-cho-bao-tri-dinh-ky', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'SUCCESS', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 1680000, minStock: 5, maxStock: 30, imageUrl: null,
    shortDescription: 'Sản phẩm catalog phục vụ kế hoạch bảo trì lốp xe nâng, phù hợp khi doanh nghiệp muốn chuẩn bị phương án thay trước khi xe dừng đột xuất.',
    description: 'Bảo trì lốp hiệu quả bắt đầu bằng việc kiểm tra định kỳ thay vì xử lý khi xe đã vận hành không ổn định. Lốp đặc Success 6.00-9 là lựa chọn được mô tả cho tình huống doanh nghiệp muốn chuẩn bị hàng thay thế theo danh mục xe. Nên lập bảng theo dõi ký hiệu lốp, vị trí bánh, ngày lắp và nhận xét về độ mòn. Khi phát hiện lốp mòn khác thường, hãy kiểm tra mâm, bạc đạn và hệ thống lái cùng lúc. Trước khi đặt sản phẩm, đối chiếu kích thước trên xe và xác nhận kiểu mâm để tránh phải đổi trả do sai cấu hình.',
    highlights: ['Hỗ trợ lập danh mục phụ tùng bảo trì', 'Khuyến khích theo dõi lịch sử lắp lốp', 'Kiểm tra đồng thời mâm và hệ thống lái'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }], applications: ['Bảo trì đội xe', 'Kho phụ tùng', 'Nhà máy vận hành nhiều xe nâng'],
    seo: { title: 'Lốp đặc Success 6.00-9 cho bảo trì xe nâng', description: 'Tham khảo lốp đặc Success 6.00-9 cho kế hoạch bảo trì xe nâng. Kiểm tra ký hiệu lốp, mâm và lịch sử mòn trước khi thay.', keywords: ['lốp Success 6.00-9', 'bảo trì lốp xe nâng', 'vỏ đặc xe nâng'] }, tags: ['SUCCESS', '6.00-9', 'bảo trì xe nâng', 'lốp đặc'], status: draft,
  },
  {
    id: 'product-tire-deestone-700-12-mixed-ground', sku: 'SEED-DEESTONE-700-12', name: 'Lốp hơi Deestone 7.00-12 cho nền hỗn hợp', slug: 'lop-hoi-deestone-7-00-12-cho-nen-hon-hop', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '7.00-12', brand: 'DEESTONE', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'USED', importPrice: 0, sellingPrice: 2650000, minStock: 5, maxStock: 30, imageUrl: null,
    shortDescription: 'Lốp hơi cho tình huống xe nâng di chuyển qua cả nền bê tông trong kho lẫn sân bãi, cần có quy trình kiểm tra trước mỗi ca.',
    description: 'Một số đội xe phải di chuyển giữa kho trong nhà, khu tập kết và sân giao hàng trong cùng ca làm việc. Lốp hơi Deestone 7.00-12 được mô tả theo nhu cầu vận hành trên bề mặt hỗn hợp này. Để chọn đúng, hãy kiểm tra không chỉ kích thước mà cả điều kiện đường đi thường xuyên, vật cản và tần suất kiểm tra xe. Hông lốp, van và mâm nên được quan sát trước khi lắp. Sau đó, áp suất cần được theo dõi theo hướng dẫn kỹ thuật của xe; không sử dụng cảm nhận bằng mắt để kết luận lốp đủ áp. Nếu nền làm việc có vật sắc, cần tăng cường vệ sinh lộ trình thay vì chỉ thay lốp.',
    highlights: ['Phù hợp lộ trình nền hỗn hợp', 'Khuyến nghị kiểm tra trước mỗi ca', 'Cần theo dõi áp suất theo hướng dẫn xe'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Kiểu lốp', value: 'Lốp hơi' }], applications: ['Kho và sân bãi', 'Khu tập kết hàng', 'Đường nội bộ'],
    seo: { title: 'Lốp hơi Deestone 7.00-12 cho nền hỗn hợp', description: 'Lốp hơi Deestone 7.00-12 cho xe nâng di chuyển giữa kho và sân bãi. Kiểm tra mâm, van và quy trình áp suất trước khi dùng.', keywords: ['lốp Deestone 7.00-12', 'lốp xe nâng nền hỗn hợp', 'lốp hơi forklift'] }, tags: ['DEESTONE', '7.00-12', 'nền hỗn hợp', 'lốp hơi'], status: draft,
  },
  {
    id: 'product-tire-mr-solid-500-8-compact', sku: 'SEED-MRSOLID-500-8', name: 'Lốp đặc MR.SOLID 5.00-8 cho xe nâng gọn', slug: 'lop-dac-mr-solid-5-00-8-cho-xe-nang-gon', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '5.00-8', brand: 'MR.SOLID', tireType: 'SOLID', rimType: 'STANDARD', condition: 'NEW_100', importPrice: 0, sellingPrice: 1850000, minStock: 4, maxStock: 25, imageUrl: null,
    shortDescription: 'Lốp đặc 5.00-8 cho nhu cầu thay thế trên xe nâng kích thước gọn; khách cần xác định chính xác cấu hình bánh và mâm đang sử dụng.',
    description: 'Các xe nâng có kích thước gọn thường làm việc ở khu vực lối đi hẹp hoặc không gian chứa hàng giới hạn. Mẫu MR.SOLID 5.00-8 được tạo để hỗ trợ nhu cầu đối chiếu lốp thay thế trong nhóm này. Hãy kiểm tra kỹ ký hiệu trên hông lốp, đường kính mâm và vị trí bánh trước hay bánh sau; các thông tin này không nên suy đoán chỉ dựa vào dòng xe. Nếu xe từng thay mâm, cần xác nhận cấu hình hiện tại thay vì thông số ban đầu. Sau khi lắp, kiểm tra khả năng đánh lái hết hành trình và khoảng hở bánh xe để phát hiện va chạm bất thường.',
    highlights: ['Dành cho nhu cầu xe nâng gọn', 'Cần xác nhận vị trí bánh và mâm', 'Kiểm tra khoảng hở sau lắp đặt'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '5.00-8' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }], applications: ['Lối đi hẹp', 'Kho kệ thấp', 'Khu vực chứa hàng gọn'],
    seo: { title: 'Lốp đặc MR.SOLID 5.00-8 cho xe nâng gọn', description: 'Tham khảo lốp đặc MR.SOLID 5.00-8 cho xe nâng gọn. Cần xác nhận ký hiệu lốp, mâm và vị trí bánh trước khi thay.', keywords: ['MR.SOLID 5.00-8', 'lốp xe nâng gọn', 'bánh xe nâng 5.00-8'] }, tags: ['MR.SOLID', '5.00-8', 'xe nâng gọn', 'lốp đặc'], status: draft,
  },
  {
    id: 'product-tire-bridgestone-700-12-inspection', sku: 'SEED-BRIDGESTONE-700-12', name: 'Lốp hơi Bridgestone 7.00-12 cần kiểm tra mâm', slug: 'lop-hoi-bridgestone-7-00-12-can-kiem-tra-mam', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '7.00-12', brand: 'BRIDGESTONE', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'NEW_100', importPrice: 0, sellingPrice: 2100000, minStock: 5, maxStock: 30, imageUrl: null,
    shortDescription: 'Sản phẩm tập trung vào bước kiểm tra mâm trước khi thay lốp hơi, giúp hạn chế tình trạng lắp lốp mới lên mâm đã có dấu hiệu bất thường.',
    description: 'Lốp mới không thể khắc phục các vấn đề phát sinh từ mâm bị biến dạng, van không kín hoặc bề mặt tiếp xúc bị hư hại. Vì vậy mẫu Bridgestone 7.00-12 này được trình bày theo góc kiểm tra mâm trước khi thay lốp. Khi tháo bánh, hãy quan sát mép mâm, tình trạng bu-lông và bất kỳ dấu hiệu va đập nào. Nếu có nghi ngờ, nên dừng quyết định lắp mới để kiểm tra thêm. Khi thông số lốp cũ là 7.00-12 và kiểu mâm phù hợp, người dùng vẫn cần xác nhận vị trí lắp và điều kiện xe hoạt động. Sau lắp đặt, hãy kiểm tra áp suất và độ kín van theo quy trình kỹ thuật.',
    highlights: ['Ưu tiên kiểm tra mâm trước khi thay', 'Không dùng lốp mới để che lỗi cơ khí', 'Kiểm tra van và áp suất sau lắp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Kiểu lốp', value: 'Lốp hơi' }], applications: ['Thay lốp có kiểm tra mâm', 'Bảo dưỡng xe nâng', 'Bãi vận hành'],
    seo: { title: 'Lốp hơi Bridgestone 7.00-12: kiểm tra mâm', description: 'Lốp hơi Bridgestone 7.00-12 cho nhu cầu thay thế có kiểm tra mâm. Quan sát mép mâm, van và kích thước lốp trước khi lắp.', keywords: ['Bridgestone 7.00-12', 'kiểm tra mâm xe nâng', 'lốp hơi forklift'] }, tags: ['BRIDGESTONE', '7.00-12', 'kiểm tra mâm', 'lốp hơi'], status: draft,
  },
  {
    id: 'product-tire-used-600-9-selection', sku: 'SEED-USED-600-9', name: 'Lốp xe nâng cũ 6.00-9 cần kiểm tra thực tế', slug: 'lop-xe-nang-cu-6-00-9-can-kiem-tra-thuc-te', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: null, tireType: 'SOLID', rimType: 'CLICK', condition: 'USED', importPrice: 0, sellingPrice: 1950000, minStock: 1, maxStock: 10, imageUrl: null,
    shortDescription: 'Danh mục lốp xe nâng đã qua sử dụng cho khách cần tối ưu ngân sách, với yêu cầu kiểm tra trực tiếp tình trạng từng chiếc trước khi quyết định.',
    description: 'Lốp xe nâng cũ không nên được xem như một sản phẩm đồng nhất vì mức độ mòn và lịch sử sử dụng của từng chiếc có thể khác nhau. Trang sản phẩm này dùng để ghi nhận nhu cầu tìm lốp 6.00-9 đã qua sử dụng, không đưa ra cam kết về thời gian sử dụng còn lại. Khi kiểm tra, khách nên quan sát phần gai, hông lốp, bề mặt tiếp xúc với mâm và các dấu hiệu biến dạng. Cần đối chiếu kích thước, kiểu mâm và vị trí lắp trên xe. Chỉ nên quyết định sau khi kiểm tra thực tế hoặc có hình ảnh hiện trạng rõ ràng. Nếu cần lắp theo cặp, hãy so sánh tình trạng hai lốp để tránh chênh lệch quá lớn.',
    highlights: ['Tối ưu ngân sách theo tình trạng thực tế', 'Không cam kết tuổi thọ còn lại', 'Khuyến nghị kiểm tra trực tiếp từng chiếc'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Tình trạng', value: 'Đã qua sử dụng' }, { label: 'Lưu ý', value: unknownSizeNote }], applications: ['Thay thế có kiểm tra thực tế', 'Nhu cầu ngân sách linh hoạt'],
    seo: { title: 'Lốp xe nâng cũ 6.00-9 cần kiểm tra thực tế', description: 'Tham khảo lốp xe nâng cũ 6.00-9 cho nhu cầu tối ưu ngân sách. Kiểm tra gai, hông lốp, mâm và tình trạng từng chiếc trước khi chọn.', keywords: ['lốp xe nâng cũ 6.00-9', 'vỏ xe nâng cũ', 'lốp đặc xe nâng đã qua sử dụng'] }, tags: ['lốp xe nâng cũ', '6.00-9', 'đã qua sử dụng', 'kiểm tra thực tế'], status: draft,
  },
  {
    id: 'product-tire-casumina-600-9-rim-check', sku: 'SEED-CASUMINA-600-9', name: 'Lốp đặc Casumina 6.00-9 cần đối chiếu mâm', slug: 'lop-dac-casumina-6-00-9-can-doi-chieu-mam', type: ProductType.TIRE, categoryId: 'category-tires',
    size: '6.00-9', brand: 'CASUMINA', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: 2350000, minStock: 5, maxStock: 40, imageUrl: null,
    shortDescription: 'Lốp đặc cho khách đang tìm size 6.00-9 và muốn xác nhận khả năng dùng lại mâm hiện có trước khi đưa xe đi ép lốp.',
    description: 'Khi thay lốp đặc, câu hỏi thường gặp là mâm hiện có có thể tiếp tục sử dụng hay không. Mẫu Casumina 6.00-9 được đưa vào catalog với trọng tâm là bước đối chiếu mâm. Trước tiên, kiểm tra kích thước trên lốp cũ và kiểu mâm gài thực tế. Sau đó quan sát mép mâm, vị trí tiếp xúc và tình trạng bu-lông. Nếu xe từng bị va chạm hoặc có rung bất thường, nên kiểm tra thêm trước khi ép lốp. Việc chuẩn bị ảnh bánh xe đầy đủ giúp tư vấn nhanh hơn, đồng thời hạn chế chọn sai cấu hình. Sau lắp đặt, cần chạy thử và kiểm tra lại các dấu hiệu bất thường.',
    highlights: ['Tập trung vào khả năng dùng lại mâm', 'Nên chuẩn bị ảnh bánh xe trước khi tư vấn', 'Chạy thử sau lắp đặt'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Kiểu lốp', value: 'Lốp đặc' }, { label: 'Kiểu mâm tham chiếu', value: 'CLICK' }], applications: ['Thay lốp kèm kiểm tra mâm', 'Kho hàng', 'Bảo trì xe nâng'],
    seo: { title: 'Lốp đặc Casumina 6.00-9 cần đối chiếu mâm', description: 'Lốp đặc Casumina 6.00-9 cho nhu cầu thay lốp kèm kiểm tra mâm. Gửi ảnh bánh xe và đối chiếu kiểu mâm trước khi ép.', keywords: ['Casumina 6.00-9', 'mâm xe nâng', 'lốp đặc xe nâng'] }, tags: ['CASUMINA', '6.00-9', 'mâm xe nâng', 'lốp đặc'], status: draft,
  },
];

const catalogImageByProductId: Record<string, string> = {
  'product-tire-phoenix-600-9-sharp-floor': '/images/products/solid-workshop.png',
  'product-tire-solitech-500-8-clean-floor': '/images/products/non-marking-clean-floor.png',
  'product-tire-dunlop-700-12-outdoor': '/images/products/pneumatic-outdoor.png',
  'product-tire-yokohama-700-12-yard': '/images/products/pneumatic-outdoor.png',
  'product-tire-tiron-700-12-replacement': '/images/products/pneumatic-outdoor.png',
  'product-tire-deestone-700-12-mixed-ground': '/images/products/pneumatic-outdoor.png',
  'product-tire-bridgestone-700-12-inspection': '/images/products/pneumatic-outdoor.png',
  'product-tire-used-600-9-selection': '/images/products/solid-workshop.png',
};

for (const product of forkliftTireProducts) {
  product.imageUrl = catalogImageByProductId[product.id]
    ?? (product.tireType === 'NON_MARKING' ? '/images/products/non-marking-clean-floor.png' : '/images/products/solid-warehouse.png');
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('vi-VN').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function similarity(left: string, right: string): number {
  const leftWords = new Set(normalize(left).split(' ').filter(Boolean));
  const rightWords = new Set(normalize(right).split(' ').filter(Boolean));
  const union = new Set([...leftWords, ...rightWords]);
  let shared = 0;
  for (const word of leftWords) if (rightWords.has(word)) shared += 1;
  return union.size === 0 ? 0 : shared / union.size;
}

export function assertForkliftTireSeedQuality(products: readonly ForkliftTireProductSeed[]): void {
  const duplicate = (values: string[], label: string) => {
    const seen = new Set<string>();
    for (const value of values) {
      const key = normalize(value);
      if (seen.has(key)) throw new Error(`Duplicate ${label}: ${value}`);
      seen.add(key);
    }
  };
  duplicate(products.map((product) => product.slug), 'slug');
  duplicate(products.map((product) => product.name), 'name');
  duplicate(products.map((product) => String(product.seo.title)), 'SEO title');
  duplicate(products.map((product) => String(product.seo.description)), 'SEO description');

  for (let index = 0; index < products.length; index += 1) {
    for (let comparedIndex = index + 1; comparedIndex < products.length; comparedIndex += 1) {
      const score = similarity(products[index].description, products[comparedIndex].description);
      if (score >= 0.62) throw new Error(`Descriptions are too similar: ${products[index].slug} / ${products[comparedIndex].slug}`);
    }
  }
}
