import { ContentStatus } from '@prisma/client';
import { ProductionSeed } from './types';

/**
 * Warehouse diary release: 17-18 September 2026.
 * Editorial content is deliberately stored separately from media. The original
 * conversation uploads must be transferred to managed public storage before
 * attaching image/video URLs; never commit binaries to this public repository.
 */
const entries = [
  {
    slug: 'nhat-ky-don-kho-vo-mam-xe-nang-ngay-4-17-09-2026',
    title: 'Ngày 4 dọn kho vỏ mâm xe nâng (17/09/2026): Tiếp tục chuyển hàng, chuẩn bị sắp xếp kho mới',
    excerpt: 'Nhật ký ngày 4: tiếp nối những ngày đầu dọn kho vỏ và mâm xe nâng, tập trung vào việc di chuyển hàng hóa và chuẩn bị cho giai đoạn phân loại tại kho mới.',
    description: 'Ngày 4 dọn kho vỏ mâm xe nâng 17/09/2026: tiếp tục di chuyển các loại vỏ, mâm từ kho cũ và chuẩn bị sắp xếp kho mới.',
    keyword: 'dọn kho vỏ mâm xe nâng',
    tags: ['nhật ký chuyển kho', 'dọn kho vỏ xe nâng', 'mâm xe nâng'],
    sections: [
      ['Tiếp nối những ngày đầu dọn kho', [
        'Bước sang ngày thứ tư, công việc chuyển kho vỏ và mâm xe nâng vẫn là một quá trình cần nhiều công đoạn. Những ngày đầu đã cho thấy số lượng và chủng loại vật tư tích lũy theo thời gian; càng di chuyển sâu vào bên trong, việc nhận diện, gom nhóm và kiểm tra từng loại càng trở nên quan trọng.',
        'Thay vì kể lại toàn bộ những gì đã làm từ đầu, nhật ký hôm nay ghi nhận giai đoạn tiếp nối: chuyển dần hàng hóa ra khỏi kho cũ, đồng thời tính đến cách tập kết sao cho thuận tiện để kiểm kê sau này.'
      ]],
      ['Không chỉ chuyển vỏ, còn phải chú ý đến mâm xe nâng', [
        'Vỏ xe nâng có nhiều kích thước và kiểu gai, còn mâm xe nâng khác nhau ở kiểu kết cấu và kích thước lắp ghép. Khi nhiều loại hàng nằm chung một khu vực, việc tách và nhận diện trước khi đưa vào vị trí lưu trữ mới sẽ giúp hạn chế nhầm lẫn.',
        'Các món đã qua sử dụng cần được kiểm tra thực tế về tình trạng, không nên đánh giá chất lượng chỉ dựa vào vẻ ngoài trong ảnh. Những bước kiểm kê và phân loại chi tiết vẫn là phần công việc tiếp theo.'
      ]],
      ['Chuẩn bị cho việc tổ chức lại kho mới', [
        'Chuyển kho là cơ hội nhìn lại cách bố trí vật tư. Hàng có thể được tập kết trước, nhưng về lâu dài vẫn cần các khu vực rõ ràng cho vỏ, mâm và những món đang chờ kiểm tra. Lối đi và khả năng lấy hàng cũng phải được cân nhắc khi xếp các chồng hàng nặng.',
        'Qua bốn ngày, mục tiêu không chỉ là đưa hết đồ ra khỏi nơi cũ, mà còn hướng đến một kho dễ tra cứu và phục vụ khách hàng hơn.'
      ]],
      ['Chờ những thay đổi rõ hơn trong ngày tiếp theo', [
        'Ngày thứ tư khép lại trong mạch công việc dọn và chuyển kho còn tiếp diễn. Khi có thêm hình ảnh ở cả hai đầu kho, chúng tôi sẽ dễ đối chiếu đâu là phần đã thông thoáng, đâu là hàng còn ở lại và kho mới đã hình thành những khu vực tập kết như thế nào.',
        'Nhật ký ngày 5 sẽ tiếp tục câu chuyện này bằng hình ảnh thực tế của cả kho cũ và kho mới.'
      ]]
    ],
  },
  {
    slug: 'ngay-5-chuyen-kho-vo-xe-nang-18-09-2026',
    title: 'Ngày 5 chuyển kho vỏ xe nâng (18/09/2026): Kho cũ dần thông thoáng, kho mới bắt đầu thành hình',
    excerpt: 'Ngày 18/09/2026, lối giữa kho cũ dần lộ ra, trong khi tại kho mới, nhiều dãy mâm và vỏ xe nâng đã được tập kết dọc theo tường.',
    description: 'Ngày 5 chuyển kho vỏ xe nâng 18/09/2026: kho cũ dần thông thoáng, kho mới hình thành các dãy mâm và vỏ xe nâng qua hình ảnh thực tế.',
    keyword: 'chuyển kho vỏ xe nâng',
    tags: ['nhật ký chuyển kho', 'vỏ xe nâng cũ', 'mâm xe nâng', 'dọn kho vỏ xe nâng'],
    sections: [
      ['Kho cũ: Những khoảng trống dần xuất hiện', [
        'Sau những ngày liên tục thu gom và di chuyển, không gian kho cũ bắt đầu thay đổi rõ rệt. Trên ảnh ngày 18/09, lối giữa đã lộ ra nhiều khoảng sàn, dù hai bên và phía sâu trong kho vẫn còn những chồng vỏ xe nâng cao, có món dựng sát tường, có món nằm rải rác trên nền.',
        'Khi hàng hóa được chuyển bớt, nền kho với bụi đất và các mảnh vật liệu cũ cũng lộ rõ. Vì vậy, ngay cả khi những chồng vỏ còn lại được đưa đi, khâu vệ sinh và thu dọn vẫn sẽ cần thêm công sức.'
      ]],
      ['Kho mới: Các dãy mâm và vỏ bắt đầu hình thành', [
        'Tại kho mới, sự khác biệt về không gian dễ thấy hơn: mái tôn cao, ánh sáng tự nhiên và nền gạch sáng. Dọc tường đã xuất hiện nhiều chồng mâm xe nâng bằng thép với kiểu dáng, đường kính và độ rộng khác nhau. Một số mâm có dấu vết bụi bẩn hoặc rỉ sét từ quá trình sử dụng và lưu kho.',
        'Phía sau và xen giữa các chồng mâm là nhiều vỏ xe nâng có kích thước, kiểu gai khác nhau. Những dãy hàng kéo dài về cuối kho cho thấy khu tập kết đang dần thành hình, dù việc xếp hàng hiện tại chưa đồng nghĩa với kiểm kê hoặc phân loại hoàn chỉnh.'
      ]],
      ['So sánh hai kho để thấy tiến độ', [
        'Nhìn riêng từng tấm ảnh, chúng ta có thể chỉ thấy vỏ và mâm chất thành chồng. Nhưng khi đặt hình kho cũ cạnh hình kho mới, sự chuyển biến hiện lên rõ ràng hơn: một bên có thêm khoảng trống giữa nền đất, bên kia có những dãy hàng tập kết sát tường.',
        'Đây là điểm tiếp nối của những ngày trước: từ công việc gom và di chuyển từng phần, đến lúc hình dung được bố cục khu kho mới và khối lượng hàng vẫn còn ở nơi cũ.'
      ]],
      ['Tổ chức lại kho: Bước tiếp theo sau vận chuyển', [
        'Nhiều loại vỏ xe nâng và mâm xe nâng có ngoại hình gần giống nhau nhưng không thể thay thế lẫn nhau nếu khác kích thước hoặc kết cấu. Vỏ đặc, vỏ hơi, hàng đã qua sử dụng và các loại mâm đều cần được nhận diện và đối chiếu thông số trên hiện vật.',
        'Riêng mâm cũ, cần chú ý tình trạng kết cấu, mép mâm và những vị trí lắp ghép khi đánh giá khả năng sử dụng. Những quan sát này là hướng kiểm tra cần làm, không phải kết luận chất lượng chỉ dựa trên ảnh chuyển kho.'
      ]],
      ['Ngày 5 khép lại: Chưa xong nhưng đã thấy rõ thay đổi', [
        'Ở kho cũ vẫn còn nhiều hàng, đặc biệt phía trong và hai bên vách. Ở kho mới, các dãy mâm và vỏ đã bắt đầu thành hình. Việc vận chuyển, vệ sinh, kiểm kê và tổ chức vị trí lưu trữ vẫn còn ở phía trước.',
        'Mỗi khoảng trống được mở ra ở kho cũ và mỗi dãy hàng hình thành ở kho mới đều ghi lại một bước tiến của hành trình chuyển kho. Các ngày tiếp theo sẽ tiếp tục phản ánh những công việc thực tế, không lặp lại những gì đã kể.'
      ]]
    ],
  },
] as const;

const anchor = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const warehouseDay4Day5PostsSeed: ProductionSeed = {
  key: '013-warehouse-day4-day5-posts',
  name: 'Create warehouse relocation diary posts for 17 and 18 September 2026',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const entry of entries) {
      const data = {
        title: entry.title,
        slug: entry.slug,
        excerpt: entry.excerpt,
        tags: [...entry.tags],
        content: '<p>' + esc(entry.excerpt) + '</p>' +
          entry.sections.map(([heading, paragraphs]) =>
            '<h2 id="' + anchor(heading) + '">' + esc(heading) + '</h2>' +
            paragraphs.map(p => '<p>' + esc(p) + '</p>').join('')
          ).join('') +
          '<p>Xem thêm các bài viết trong <a href="/blog">nhật ký chuyển kho</a> và thông tin sản phẩm tại <a href="/products">danh mục vỏ, mâm xe nâng</a>.</p>',
        tableOfContents: entry.sections.map(([title]) => ({ title, anchor: anchor(title) })),
        seo: {
          title: entry.title,
          description: entry.description,
          primaryKeyword: entry.keyword,
          secondaryKeywords: entry.tags.filter(t => t !== entry.keyword),
          keywords: [...entry.tags],
          canonicalPath: '/blog/' + entry.slug,
          robots: 'index,follow',
        },
        status: ContentStatus.PUBLISHED,
      };
      // Never overwrite editorial changes to an existing post on a repeat release.
      await database.post.upsert({ where: { slug: entry.slug }, create: data, update: {} });
    }
  },
};
