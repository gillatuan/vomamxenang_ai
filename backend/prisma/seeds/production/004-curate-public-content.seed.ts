import { ContentStatus, ProductType } from '@prisma/client';
import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

const published = ContentStatus.PUBLISHED;

const curatedProducts = [
  {
    id: 'product-1', sku: 'VMXN-SOLID-600-9', type: ProductType.TIRE,
    name: 'Lốp đặc xe nâng 6.00-9 cho kho xưởng', slug: 'lop-dac-xe-nang-6-00-9-cho-kho-xuong', size: '6.00-9', brand: null,
    tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 0, sellingPrice: null, minStock: 5, maxStock: 40, imageUrl: null,
    shortDescription: 'Giải pháp lốp đặc cho xe nâng vận hành trong kho, ưu tiên giảm gián đoạn do sự cố liên quan đến áp suất lốp.',
    description: 'Lốp đặc 6.00-9 là lựa chọn thường được cân nhắc cho xe nâng làm việc theo ca trong kho và nhà xưởng có nền tương đối bằng phẳng. Vì không sử dụng hơi, loại lốp này giúp đội vận hành hạn chế việc xử lý sự cố mất áp. Trước khi thay, cần đối chiếu ký hiệu trên hông lốp cũ, kiểu mâm đang dùng và tình trạng hai bánh trên cùng trục. Mâm có dấu hiệu biến dạng, mép mâm hư hại hoặc xe rung bất thường nên được kiểm tra trước khi ép lốp. Sau lắp đặt, hãy chạy thử ở tốc độ thấp và theo dõi độ ổn định của xe.',
    highlights: ['Phù hợp nhịp vận hành trong kho', 'Hạn chế rủi ro liên quan đến áp suất lốp', 'Cần xác nhận kiểu mâm trước khi ép'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '6.00-9' }, { label: 'Loại lốp', value: 'Lốp đặc' }, { label: 'Lưu ý lắp đặt', value: 'Đối chiếu mâm và hông lốp thực tế' }],
    applications: ['Kho hàng', 'Nhà xưởng', 'Khu đóng gói'],
    seo: { title: 'Lốp đặc xe nâng 6.00-9 cho kho xưởng', description: 'Tìm hiểu lốp đặc xe nâng 6.00-9 cho kho xưởng. Kiểm tra kích thước, kiểu mâm và tình trạng bánh trước khi thay.', keywords: ['lốp đặc xe nâng 6.00-9', 'vỏ xe nâng kho xưởng', 'thay lốp xe nâng'] },
    tags: ['lốp đặc xe nâng', '6.00-9', 'kho xưởng'], status: published,
  },
  {
    id: 'product-2', sku: 'VMXN-PNEUMATIC-700-12', type: ProductType.TIRE,
    name: 'Lốp hơi xe nâng 7.00-12 cho sân bãi', slug: 'lop-hoi-xe-nang-7-00-12-cho-san-bai', size: '7.00-12', brand: null,
    tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'NEW_100', importPrice: 0, sellingPrice: null, minStock: 5, maxStock: 40, imageUrl: null,
    shortDescription: 'Lốp hơi 7.00-12 cho xe nâng di chuyển giữa khu giao nhận, đường nội bộ và các bề mặt có độ gồ ghề khác nhau.',
    description: 'Xe nâng vận hành ở sân bãi hoặc khu giao nhận thường đi qua nền bê tông, ram dốc và các đoạn đường có độ bằng phẳng khác nhau. Lốp hơi 7.00-12 phù hợp để tham khảo cho bối cảnh này, với điều kiện doanh nghiệp có quy trình kiểm tra áp suất và quan sát hông lốp định kỳ. Trước khi thay, hãy xác nhận kích thước lốp cũ, kiểu mâm, van lốp và vị trí bánh trước hoặc sau. Không nên tiếp tục vận hành khi lốp mất áp bất thường, hông lốp bị tổn thương hoặc xe có hiện tượng kéo lệch.',
    highlights: ['Phù hợp xe nâng di chuyển sân bãi', 'Cần kiểm tra áp suất theo lịch vận hành', 'Đối chiếu mâm, van và vị trí bánh trước khi lắp'],
    specifications: [{ label: 'Kích thước tham chiếu', value: '7.00-12' }, { label: 'Loại lốp', value: 'Lốp hơi' }, { label: 'Lưu ý', value: 'Kiểm tra áp suất theo khuyến nghị kỹ thuật của xe' }],
    applications: ['Khu giao nhận', 'Sân bãi', 'Đường nội bộ nhà máy'],
    seo: { title: 'Lốp hơi xe nâng 7.00-12 cho sân bãi', description: 'Lốp hơi xe nâng 7.00-12 cho khu giao nhận và sân bãi. Kiểm tra mâm, van và áp suất trước khi vận hành.', keywords: ['lốp hơi xe nâng 7.00-12', 'vỏ xe nâng sân bãi', 'lốp xe nâng ngoài trời'] },
    tags: ['lốp hơi xe nâng', '7.00-12', 'sân bãi'], status: published,
  },
  {
    id: 'product-3', sku: 'VMXN-SERVICE-TIRE-RIM', type: ProductType.SERVICE,
    name: 'Dịch vụ khảo sát, thay lốp và ép mâm xe nâng', slug: 'dich-vu-thay-lop-ep-mam-xe-nang', size: null, brand: null,
    tireType: null, rimType: null, condition: null, importPrice: 0, sellingPrice: null, minStock: 0, maxStock: 0, imageUrl: null,
    shortDescription: 'Hỗ trợ khảo sát hiện trạng bánh xe, đối chiếu lốp–mâm và tư vấn phương án thay thế phù hợp điều kiện vận hành.',
    description: 'Một lần thay lốp hiệu quả không chỉ dừng ở việc chọn đúng kích thước. Đội ngũ kỹ thuật sẽ cùng khách hàng kiểm tra ký hiệu lốp, kiểu mâm, bề mặt tiếp xúc, van lốp và dấu hiệu mòn không đều trước khi đề xuất phương án. Với lốp đặc, bước kiểm tra mâm và quy trình ép cần được thực hiện cẩn thận; với lốp hơi, áp suất và độ kín van cần được kiểm tra sau lắp đặt. Khách hàng nên chuẩn bị ảnh bánh xe, dòng xe, vị trí bánh và mô tả mặt bằng làm việc để quá trình tư vấn nhanh và chính xác hơn.',
    highlights: ['Khảo sát tình trạng lốp và mâm', 'Tư vấn theo tải trọng và mặt bằng vận hành', 'Hướng dẫn kiểm tra sau lắp đặt'],
    specifications: [{ label: 'Phạm vi', value: 'Khảo sát, thay lốp, ép mâm' }, { label: 'Thông tin cần chuẩn bị', value: 'Ảnh lốp, mâm, dòng xe và vị trí bánh' }],
    applications: ['Bảo trì đội xe', 'Thay lốp định kỳ', 'Xử lý bánh xe vận hành bất thường'],
    seo: { title: 'Dịch vụ thay lốp và ép mâm xe nâng', description: 'Khảo sát, tư vấn thay lốp và ép mâm xe nâng theo hiện trạng thực tế. Chuẩn bị ảnh lốp, mâm và thông tin xe để được hỗ trợ.', keywords: ['thay lốp xe nâng', 'ép mâm xe nâng', 'bảo trì bánh xe nâng'] },
    tags: ['dịch vụ xe nâng', 'thay lốp', 'ép mâm'], status: published,
  },
];

const curatedPosts = [
  {
    id: 'post-1', slug: 'chon-lop-dac-hay-lop-hoi-cho-xe-nang', title: 'Nên chọn lốp đặc hay lốp hơi cho xe nâng?',
    excerpt: 'Hướng dẫn đối chiếu môi trường làm việc, tần suất vận hành và quy trình bảo trì trước khi chọn lốp cho xe nâng.',
    content: 'Lốp đặc và lốp hơi phục vụ những điều kiện vận hành khác nhau. Lốp đặc thường được cân nhắc cho kho, xưởng và khu vực cần giảm gián đoạn do mất áp. Lốp hơi phù hợp để tham khảo khi xe thường di chuyển qua sân bãi hoặc bề mặt có độ gồ ghề, nhưng cần quy trình theo dõi áp suất và hông lốp.\n\nTrước khi quyết định, hãy ghi nhận bốn thông tin: ký hiệu lốp hiện tại, kiểu mâm, vị trí bánh và mặt bằng xe thường chạy. Nếu lốp mòn lệch, xe rung hoặc kéo lái, nên kiểm tra thêm mâm và hệ thống lái; thay lốp mới đơn thuần có thể không xử lý được nguyên nhân gốc.\n\nLựa chọn đúng là phương án phù hợp với xe và điều kiện thực tế, không chỉ dựa vào thương hiệu hoặc giá bán. Một buổi khảo sát ngắn trước khi lắp giúp tránh sai kích thước và giảm thời gian dừng xe.',
    tags: ['lốp đặc xe nâng', 'lốp hơi xe nâng', 'tư vấn xe nâng'], seo: { title: 'Nên chọn lốp đặc hay lốp hơi cho xe nâng?', description: 'So sánh lốp đặc và lốp hơi xe nâng theo môi trường vận hành, kiểm tra mâm và kế hoạch bảo trì.', keywords: ['lốp đặc hay lốp hơi', 'chọn lốp xe nâng', 'bảo trì xe nâng'] }, status: published,
  },
  {
    id: 'post-2', slug: 'doc-thong-so-lop-xe-nang-truoc-khi-thay', title: 'Cách đọc thông số lốp xe nâng trước khi thay',
    excerpt: 'Những thông tin cần chụp và đối chiếu để tư vấn đúng lốp, đúng mâm và đúng vị trí bánh.',
    content: 'Các kích thước như 5.00-8, 6.00-9, 7.00-12 hay 815-15 là điểm bắt đầu để xác định lốp thay thế, nhưng không phải thông tin duy nhất. Hãy chụp rõ hông lốp cũ để lưu lại kích thước, loại lốp và các ký hiệu liên quan.\n\nTiếp theo, cần kiểm tra kiểu mâm, tình trạng mép mâm, van lốp và vị trí bánh trên xe. Một số xe đã từng thay mâm hoặc thay đổi cấu hình, vì vậy không nên chỉ dựa vào tên dòng xe. Với lốp đã mòn không đều, hãy ghi nhận vị trí mòn và hiện tượng rung hoặc lái nặng để kỹ thuật viên có thêm dữ liệu đánh giá.\n\nChuẩn bị đúng thông tin giúp quá trình báo giá nhanh hơn, giảm nguy cơ chọn sai cấu hình và hỗ trợ lên kế hoạch thay lốp theo cặp khi cần thiết.',
    tags: ['thông số lốp xe nâng', 'thay lốp xe nâng', 'mâm xe nâng'], seo: { title: 'Cách đọc thông số lốp xe nâng trước khi thay', description: 'Hướng dẫn đọc size lốp xe nâng, kiểm tra mâm và chuẩn bị thông tin trước khi thay lốp.', keywords: ['thông số lốp xe nâng', 'size lốp xe nâng', 'mâm xe nâng'] }, status: published,
  },
  {
    id: 'post-3', slug: 'lop-khong-de-lai-vet-cho-kho-sach', title: 'Khi nào nên dùng lốp xe nâng không để lại vệt?',
    excerpt: 'Lốp không để lại vệt cần được cân nhắc cùng điều kiện nền, khả năng tương thích mâm và cách vận hành xe.',
    content: 'Ở khu đóng gói, kho có nền sáng hoặc khu vực yêu cầu vệ sinh cao, vệt bánh xe có thể ảnh hưởng đến tiêu chuẩn vận hành và hình ảnh không gian. Lốp không để lại vệt là một lựa chọn để tham khảo trong các bối cảnh này.\n\nTuy nhiên, quyết định không nên chỉ dựa vào màu lốp. Cần xác nhận kích thước, loại mâm, tải trọng và lộ trình di chuyển thực tế. Các thao tác quay đầu liên tục, ram dốc hoặc nền có gờ chuyển tiếp vẫn có thể làm lốp mòn nhanh nếu không phù hợp với cách sử dụng.\n\nTrước khi thay, hãy đánh giá đồng thời bánh còn lại trên cùng trục và hiện trạng mâm. Sau lắp đặt, nên theo dõi dấu hiệu cọ sát, độ ổn định khi đánh lái và tình trạng nền trong các ca đầu tiên.',
    tags: ['lốp xe nâng không để lại vệt', 'kho sạch', 'lốp đặc xe nâng'], seo: { title: 'Khi nào nên dùng lốp xe nâng không để lại vệt?', description: 'Tìm hiểu khi nào nên chọn lốp xe nâng không để lại vệt và các bước kiểm tra mâm, tải trọng trước khi thay.', keywords: ['lốp xe nâng không để lại vệt', 'lốp non marking', 'kho sạch'] }, status: published,
  },
  {
    id: 'post-4', slug: 'kiem-tra-mam-xe-nang-truoc-khi-ep-lop', title: '5 điểm cần kiểm tra ở mâm xe nâng trước khi ép lốp',
    excerpt: 'Kiểm tra mâm giúp hạn chế tình trạng lốp mới nhưng xe vẫn rung, mất ổn định hoặc mòn bất thường.',
    content: 'Mâm là bộ phận tiếp xúc trực tiếp với lốp, vì vậy việc kiểm tra mâm trước khi ép lốp có vai trò quan trọng. Năm điểm nên xem xét gồm: mép mâm có bị biến dạng hay không; bề mặt tiếp xúc có dấu hiệu hư hại; bu-lông và vị trí lắp có chắc chắn; van lốp còn kín với cấu hình lốp hơi; và bánh còn lại trên cùng trục có mòn lệch bất thường hay không.\n\nNếu xe từng va chạm, rung mạnh hoặc lái nặng, cần trao đổi đầy đủ với kỹ thuật viên trước khi lắp lốp mới. Ép lốp lên mâm không phù hợp có thể làm việc vận hành thiếu ổn định và khiến lốp mới xuống cấp sớm.\n\nSau khi hoàn tất, hãy chạy thử ở tốc độ thấp, quan sát độ đảo của bánh và kiểm tra lại các dấu hiệu bất thường. Ghi nhận ngày thay lốp, vị trí bánh và hiện trạng ban đầu cũng giúp việc bảo trì sau này chủ động hơn.',
    tags: ['mâm xe nâng', 'ép lốp xe nâng', 'bảo trì xe nâng'], seo: { title: '5 điểm cần kiểm tra ở mâm xe nâng trước khi ép lốp', description: 'Hướng dẫn kiểm tra mâm xe nâng trước khi ép lốp để hạn chế rung, mòn bất thường và sai cấu hình.', keywords: ['kiểm tra mâm xe nâng', 'ép lốp xe nâng', 'bảo trì mâm xe nâng'] }, status: published,
  },
];

export const curatePublicContentSeed: ProductionSeed = {
  key: '004-curate-public-content',
  name: 'Replace demo catalog and blog content with curated forklift content',
  preview: { productsToCreate: 0 },
  async run(database) {
    await Promise.all(curatedProducts.map(({ id, ...data }) => database.product.upsert({ where: { id }, update: data, create: { id, ...data } })));
    await database.product.updateMany({ where: { id: { in: forkliftTireProducts.map((product) => product.id) } }, data: { status: published } });
    await Promise.all(curatedPosts.map((post) => database.post.upsert({ where: { id: post.id }, update: post, create: post })));
  },
};
