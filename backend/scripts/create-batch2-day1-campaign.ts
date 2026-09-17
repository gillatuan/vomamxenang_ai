import { ContentStatus, Prisma, PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const mediaBase = '/images/campaigns/chuyen-kho-2026/day-1';

type DraftPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  imageAlt: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
  videoUrl?: string;
};

const warehouseDrafts: DraftPost[] = [
  {
    title: 'Cập nhật chuyển kho: địa chỉ mới tại 612 Trần Đại Nghĩa',
    slug: 'cap-nhat-chuyen-kho-dia-chi-612-tran-dai-nghia',
    excerpt: 'Thông tin nháp cho chiến dịch chuyển kho 2026, sử dụng tư liệu ghi nhận trong Ngày 1.',
    content: '<h2>Thông tin cập nhật</h2><p>Chúng tôi đang chuẩn bị nội dung thông báo về kho mới tại <strong>612 Trần Đại Nghĩa, phường Tân Tạo</strong>.</p><p>Tư liệu Ngày 1 ghi nhận không gian kho với các chồng vỏ/lốp xe nâng. Các mốc vận chuyển, thời điểm hoạt động và thông tin phục vụ khách hàng sẽ được cập nhật sau khi có xác nhận.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Thời điểm chính thức vận hành tại địa chỉ mới.</p>',
    image: `${mediaBase}/kho-chong-lop-01.png`,
    imageAlt: 'Các chồng vỏ lốp xe nâng trong không gian kho ở tư liệu Ngày 1',
    primaryKeyword: 'vỏ mâm xe nâng',
    secondaryKeywords: ['vỏ xe nâng', 'lốp xe nâng', 'kho vỏ lốp xe nâng'],
    tags: ['chuyển kho 2026', 'kho mới', 'vỏ mâm xe nâng'],
  },
  {
    title: 'Nhật ký Ngày 1: ghi nhận các chồng vỏ lốp trong kho',
    slug: 'nhat-ky-ngay-1-chong-vo-lop-trong-kho',
    excerpt: 'Ghi nhận hình ảnh Ngày 1 trong chiến dịch chuyển kho, tập trung vào các chồng vỏ/lốp xe nâng trong kho.',
    content: '<h2>Tư liệu Ngày 1</h2><p>Hình ảnh ghi nhận nhiều chồng vỏ/lốp xe nâng được đặt trong khu vực kho mái tôn. Bài viết này chỉ phản ánh khung cảnh nhìn thấy trong tư liệu Ngày 1.</p><p>Việc kiểm đếm, phân loại theo kích thước hoặc tình trạng không được suy ra từ ảnh và cần được đội ngũ kho xác nhận riêng.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Danh sách hạng mục đã kiểm đếm trong ngày.</p>',
    image: `${mediaBase}/kho-chong-lop-02.png`,
    imageAlt: 'Các chồng vỏ lốp xe nâng xếp dọc theo tường kho trong tư liệu Ngày 1',
    primaryKeyword: 'vỏ xe nâng',
    secondaryKeywords: ['lốp xe nâng', 'kho vỏ lốp xe nâng', 'vỏ mâm xe nâng'],
    tags: ['chuyển kho 2026', 'nhật ký ngày 1', 'vỏ xe nâng'],
  },
  {
    title: 'Ghi nhận lối đi kho trong ngày đầu chuyển đổi',
    slug: 'ghi-nhan-loi-di-kho-ngay-dau-chuyen-doi',
    excerpt: 'Một góc lối đi kho và các chồng vỏ/lốp xe nâng được ghi nhận từ tư liệu Ngày 1.',
    content: '<h2>Một góc không gian kho</h2><p>Tư liệu Ngày 1 cho thấy lối đi dẫn về phía cửa kho, cạnh các chồng vỏ/lốp xe nâng. Nền gạch có các vệt bẩn quan sát được trong ảnh.</p><p>Bài viết không kết luận về quy trình vệ sinh, năng lực lưu trữ hoặc cách bố trí cuối cùng vì chưa có tư liệu cho các ngày tiếp theo.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Sơ đồ lối đi và phương án bố trí sau khi chuyển kho hoàn tất.</p>',
    image: `${mediaBase}/loi-di-kho-01.png`,
    imageAlt: 'Lối đi trong kho cạnh các chồng vỏ lốp xe nâng ở tư liệu Ngày 1',
    primaryKeyword: 'kho vỏ lốp xe nâng',
    secondaryKeywords: ['vỏ xe nâng', 'lốp xe nâng', 'vỏ mâm xe nâng'],
    tags: ['chuyển kho 2026', 'nhật ký ngày 1', 'kho vỏ lốp xe nâng'],
  },
  {
    title: 'Tư liệu Ngày 1: một góc kho và khu vực đặt vỏ lốp xe nâng',
    slug: 'tu-lieu-ngay-1-goc-kho-va-vo-lop-xe-nang',
    excerpt: 'Bản nháp hình ảnh về một góc kho, các chồng vỏ/lốp xe nâng và khu vực xung quanh trong Ngày 1.',
    content: '<h2>Góc kho được ghi nhận</h2><p>Ảnh Ngày 1 cho thấy một góc kho mái tôn, các chồng vỏ/lốp xe nâng, một bàn và phương tiện hai bánh ở khu vực cạnh đó.</p><p>Đây là ghi nhận thị giác, không phải xác nhận về hàng tồn, nguồn gốc sản phẩm hay điều kiện kỹ thuật. Nội dung sẽ được biên tập lại khi có tư liệu Ngày 2–4.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Ảnh và ghi chú công việc của các ngày tiếp theo.</p>',
    image: `${mediaBase}/goc-kho-01.png`,
    imageAlt: 'Một góc kho mái tôn có các chồng vỏ lốp xe nâng trong tư liệu Ngày 1',
    primaryKeyword: 'lốp xe nâng',
    secondaryKeywords: ['vỏ xe nâng', 'vỏ mâm xe nâng', 'kho vỏ lốp xe nâng'],
    tags: ['chuyển kho 2026', 'tư liệu ngày 1', 'lốp xe nâng'],
  },
  {
    title: 'Video Ngày 1: ghi nhận khu vực đặt vỏ lốp trong kho',
    slug: 'video-ngay-1-khu-vuc-dat-vo-lop-trong-kho',
    excerpt: 'Bản nháp giới thiệu video gốc Ngày 1, ghi nhận khu vực đặt các chồng vỏ/lốp trong kho.',
    content: '<h2>Video gốc Ngày 1</h2><p>Video gốc ghi nhận khu vực có các chồng vỏ/lốp xe nâng và phần tường mái tôn của kho. Video được giữ ở trạng thái tư liệu nội bộ cho đến khi biên tập viên duyệt nội dung.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Phụ đề, thời lượng hiển thị và quyền sử dụng trước khi xuất bản.</p>',
    image: `${mediaBase}/goc-kho-01.png`,
    imageAlt: 'Các chồng vỏ lốp xe nâng trong khung hình đại diện video Ngày 1',
    videoUrl: `${mediaBase}/video-goc-kho-ngay-1.mov`,
    primaryKeyword: 'vỏ mâm xe nâng',
    secondaryKeywords: ['vỏ xe nâng', 'lốp xe nâng', 'video kho'],
    tags: ['chuyển kho 2026', 'video ngày 1', 'vỏ mâm xe nâng'],
  },
];

const evergreenDrafts: DraftPost[] = [
  { title: 'Vỏ mâm xe nâng: kế hoạch nội dung theo nhu cầu tìm hiểu tổng quan', slug: 'ke-hoach-noi-dung-vo-mam-xe-nang-tong-quan', excerpt: 'Kế hoạch bài viết định hướng thông tin tổng quan, chưa đưa ra thông số kỹ thuật.', content: '<h2>Mục tiêu biên tập</h2><p>Bài nháp này hướng tới người đang tìm hiểu tổng quan về vỏ mâm xe nâng và cách xác định nhu cầu trước khi liên hệ.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Dữ liệu sản phẩm đã xác minh để bổ sung ví dụ phù hợp.</p>', image: `${mediaBase}/kho-chong-lop-01.png`, imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa', primaryKeyword: 'vỏ mâm xe nâng', secondaryKeywords: ['vỏ xe nâng', 'lốp xe nâng'], tags: ['kế hoạch evergreen', 'vỏ mâm xe nâng'] },
  { title: 'Cách chuẩn bị thông tin khi cần tư vấn vỏ xe nâng', slug: 'chuan-bi-thong-tin-khi-can-tu-van-vo-xe-nang', excerpt: 'Kế hoạch bài viết có intent tư vấn trước khi liên hệ, không thay thế xác nhận kỹ thuật.', content: '<h2>Intent tư vấn</h2><p>Bài nháp tập trung vào các câu hỏi cần chuẩn bị khi cần tư vấn vỏ xe nâng.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Danh sách dữ liệu tư vấn đã được đội ngũ kỹ thuật xác nhận.</p>', image: `${mediaBase}/kho-chong-lop-02.png`, imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa', primaryKeyword: 'vỏ xe nâng', secondaryKeywords: ['lốp xe nâng', 'vỏ mâm xe nâng'], tags: ['kế hoạch evergreen', 'vỏ xe nâng'] },
  { title: 'Lốp xe nâng: khung bài viết giải thích thuật ngữ cho người mới', slug: 'lop-xe-nang-giai-thich-thuat-ngu-cho-nguoi-moi', excerpt: 'Kế hoạch nội dung informational, phân biệt với bài tư vấn và trang sản phẩm.', content: '<h2>Intent tìm hiểu</h2><p>Bài nháp dự kiến giải thích các thuật ngữ thường gặp khi người đọc tìm hiểu lốp xe nâng.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Thuật ngữ và định nghĩa kỹ thuật đã được kiểm duyệt.</p>', image: `${mediaBase}/loi-di-kho-01.png`, imageAlt: 'Lối đi kho cạnh các chồng vỏ lốp xe nâng, dùng làm tư liệu minh họa', primaryKeyword: 'lốp xe nâng', secondaryKeywords: ['vỏ xe nâng', 'bánh xe nâng'], tags: ['kế hoạch evergreen', 'lốp xe nâng'] },
  { title: 'Lốp đặc xe nâng: kế hoạch nội dung cho nhu cầu so sánh có kiểm chứng', slug: 'ke-hoach-noi-dung-lop-dac-xe-nang-so-sanh', excerpt: 'Kế hoạch bài viết commercial research; mọi thông số phải chờ dữ liệu được xác minh.', content: '<h2>Intent so sánh</h2><p>Bài nháp dự kiến phục vụ người đang so sánh lựa chọn lốp đặc xe nâng, nhưng không đưa ra tuyên bố kỹ thuật khi chưa có dữ liệu.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Thông số sản phẩm và tiêu chí so sánh đã xác minh.</p>', image: `${mediaBase}/goc-kho-01.png`, imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa', primaryKeyword: 'lốp đặc xe nâng', secondaryKeywords: ['lốp xe nâng', 'vỏ xe nâng'], tags: ['kế hoạch evergreen', 'lốp đặc xe nâng'] },
  { title: 'Mâm xe nâng và bánh xe nâng: kế hoạch bài viết định hướng liên hệ', slug: 'mam-xe-nang-va-banh-xe-nang-dinh-huong-lien-he', excerpt: 'Kế hoạch nội dung định hướng liên hệ, tách biệt với bài tổng quan về vỏ/lốp.', content: '<h2>Intent liên hệ</h2><p>Bài nháp định hướng người đọc chuẩn bị thông tin khi cần trao đổi về mâm xe nâng hoặc bánh xe nâng.</p><p><strong>[CẦN BỔ SUNG THÔNG TIN]</strong> Dữ liệu tương thích, hình ảnh và thông số do đội ngũ xác nhận.</p>', image: `${mediaBase}/kho-chong-lop-01.png`, imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa', primaryKeyword: 'mâm xe nâng', secondaryKeywords: ['bánh xe nâng', 'vỏ mâm xe nâng'], tags: ['kế hoạch evergreen', 'mâm xe nâng', 'bánh xe nâng'] },
];

function seoFor(post: DraftPost): Prisma.InputJsonObject {
  return {
    title: post.title,
    description: post.excerpt,
    primaryKeyword: post.primaryKeyword,
    secondaryKeywords: post.secondaryKeywords,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    canonicalPath: `/blog/${post.slug}`,
    imageUrl: post.image,
    imageAlt: post.imageAlt,
    robots: 'noindex,follow',
  };
}

async function main() {
  const posts = await Promise.all([...warehouseDrafts, ...evergreenDrafts].map((post) => {
    const { image: _image, imageAlt: _imageAlt, primaryKeyword: _primaryKeyword, secondaryKeywords: _secondaryKeywords, ...data } = post;
    return db.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...data, seo: seoFor(post), status: ContentStatus.DRAFT },
    });
  }));
  const campaign = await db.contentCampaign.upsert({
    where: { slug: 'chuyen-kho-2026' },
    update: {},
    create: {
      name: 'Chuyển kho 2026',
      slug: 'chuyen-kho-2026',
      status: ContentStatus.DRAFT,
      description: 'Campaign nháp từ tư liệu Ngày 1. Tư liệu Ngày 2–4 đang chờ bổ sung.',
      goal: 'Ghi nhận quá trình chuyển kho bằng tư liệu thực tế; mọi nội dung cần biên tập viên duyệt trước khi xuất bản.',
    },
  });
  const warehouseSlugs = new Set(warehouseDrafts.map((post) => post.slug));
  await Promise.all(posts.filter((post) => warehouseSlugs.has(post.slug ?? '')).map((post, sortOrder) => db.campaignPost.upsert({
    where: { campaignId_postId: { campaignId: campaign.id, postId: post.id } },
    update: {},
    create: { campaignId: campaign.id, postId: post.id, sortOrder, notes: 'Tư liệu Ngày 1; chờ bổ sung tư liệu Ngày 2–4 trước khi hoàn thiện.' },
  })));
  await Promise.all([
    ['vỏ mâm xe nâng', 'PRIMARY', 'COMMERCIAL', 5, 'https://www.vomamxenang.com/vo-xe-nang'],
    ['vỏ xe nâng', 'SECONDARY', 'COMMERCIAL', 4, 'https://www.vomamxenang.com/vo-xe-nang'],
    ['lốp xe nâng', 'SECONDARY', 'INFORMATIONAL', 4, 'https://www.vomamxenang.com/products'],
    ['lốp đặc xe nâng', 'SUPPORTING', 'COMMERCIAL', 4, 'https://www.vomamxenang.com/lop-dac-xe-nang'],
    ['mâm xe nâng', 'SUPPORTING', 'COMMERCIAL', 3, 'https://www.vomamxenang.com/mam-xe-nang'],
    ['bánh xe nâng', 'SUPPORTING', 'INFORMATIONAL', 3, 'https://www.vomamxenang.com/products'],
    ['vỏ xe nâng đặc', 'SUPPORTING', 'COMMERCIAL', 3, 'https://www.vomamxenang.com/lop-dac-xe-nang'],
  ].map(([keyword, type, intent, priority, targetUrl]) => db.seoKeyword.upsert({
    where: { keyword },
    update: {},
    create: { keyword, type: type as 'PRIMARY' | 'SECONDARY' | 'SUPPORTING', intent: intent as 'INFORMATIONAL' | 'COMMERCIAL', priority: Number(priority), targetUrl, cluster: 'vỏ mâm xe nâng', status: 'PLANNED', notes: 'Kế hoạch topical cluster Batch 2; không có search volume, ranking hoặc chỉ số bên thứ ba chưa xác minh.' },
  })));
  console.log(`Created or retained ${posts.length} DRAFT posts and campaign ${campaign.slug}.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
