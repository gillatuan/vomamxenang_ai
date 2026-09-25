import { ContentStatus, PrismaClient } from '@prisma/client';
import { PostsService } from '../src/posts/posts.service';
import { PrismaService } from '../src/prisma/prisma.service';

const slug = 'ngay-don-kho-thu-2-sap-xep-lai-kho-lop-va-mam-xe-nang';
const db = new PrismaService();
const posts = new PostsService(db);
const mediaBase = '/images/campaigns/chuyen-kho-2026/day-2';
const image = (file: string, alt: string, caption: string) => `<figure><img src="${mediaBase}/${file}" alt="${alt}" loading="lazy" /><figcaption>${caption}</figcaption></figure>`;

const content = `<p>Ngày dọn kho thứ hai tiếp tục từ phần việc đã bắt đầu trước đó, nhưng trọng tâm chuyển hẳn sang khu vực lốp, mâm và những vật tư để gần khu vực này. Khi nhìn một kho có nhiều lốp xe nâng, mâm xe nâng và vành xe nâng đặt ở các góc khác nhau, việc đầu tiên không phải là nói đến số lượng hay thông số. Điều cần làm là nhìn lại không gian đang có: lối đi ở đâu, cụm hàng nào đang nằm gần nhau, phần nào cần được gom lại để việc tìm và lấy đồ sau này dễ hình dung hơn.</p>
<p>Bài viết sử dụng năm ảnh thực tế của Ngày 2. Mỗi ảnh được đặt ở đoạn tương ứng với những gì nhìn thấy trong kho. Không có video Ngày 2 được cung cấp, nên bài không chèn video.</p>
<h2>Bắt đầu từ một kho lốp chưa thật sự gọn</h2>
<p>Ở điểm bắt đầu của buổi dọn kho, khu vực lưu trữ có nhiều lốp, mâm/vành và vật tư đặt khá dày. Khi nhiều nhóm đồ cùng xuất hiện trong một không gian, người làm kho thường mất thêm thời gian chỉ để quan sát xem một khu vực đang có gì. Cảm giác “đông” của kho không tự nói lên số lượng hàng, chất lượng hay tình trạng kỹ thuật; nó chỉ cho thấy việc phân định khu vực cần được làm rõ hơn.</p>
${image('kho-cu-mam-lop-01.jpg', 'Khu vực kho cũ có nhiều mâm và lốp xe nâng được đặt dày', 'Khu vực kho cũ với nhiều mâm/vành và lốp đặt trong cùng không gian.')}
<p>Với lốp xe nâng, việc đặt chúng thành cụm giúp người nhìn nhận ra ranh giới giữa khu vực này và lối đi. Còn với mâm xe nâng hoặc vành xe nâng, điều quan trọng trong ngày dọn kho là đưa các vật tư về khu vực dễ nhận biết, thay vì để câu chuyện sắp xếp chỉ dừng ở việc di chuyển từ chỗ này sang chỗ khác.</p>
<h2>Kho lốp xe nâng khác gì với một kho hàng thông thường</h2>
<p>Trong kho lốp xe nâng, những vật có hình dạng tròn, kích thước bề ngoài khác nhau và có thể được đặt theo cột hoặc theo cụm thường làm không gian trông khác với kho có các thùng hàng đồng đều. Vì vậy, lối đi và ranh giới khu vực trở thành phần dễ quan sát nhất trong quá trình dọn kho. Không nên dùng ảnh để suy ra kích thước, thương hiệu, tải trọng, tuổi lốp, độ mòn hay nguồn gốc của từng món hàng.</p>
<p>Ngày 2 không phải là một bài kiểm định kỹ thuật. Đây là ghi nhận về cách làm việc với không gian: nhìn lại nơi tập kết, phân biệt khu vực chứa lốp với khu vực đặt mâm/bánh và để chừa phần di chuyển cần thiết. Những nội dung kỹ thuật về <a href="/vo-xe-nang">vỏ xe nâng</a> chỉ nên được đối chiếu từ dữ liệu sản phẩm đã xác minh, không được suy diễn từ cảnh kho.</p>
<h2>Phân loại lại lốp, mâm và các vật tư</h2>
<p>Góc nhìn sâu hơn vào khu vực kho cho thấy có nhiều mâm, bánh và lốp trong cùng một vùng lưu trữ. Công việc của buổi dọn là gom các nhóm đang rải rác về từng khu vực dễ nhìn hơn. Mục tiêu ở đây là tạo một cách quan sát rõ ràng: đi vào kho có thể thấy đâu là cụm lốp, đâu là khu vực có mâm/vành và đâu là khoảng để đi lại.</p>
${image('kho-cu-mam-lop-02.jpg', 'Góc nhìn sâu trong khu vực có nhiều mâm và lốp xe nâng', 'Góc sâu hơn của khu vực kho, nơi mâm/vành và lốp cùng được tập kết.')}
<p>Không có số liệu kiểm kê đi kèm tư liệu Ngày 2, vì vậy bài không xác nhận số lượng, chủng loại hay tình trạng của bất kỳ lốp xe nâng cũ hoặc mâm xe nâng cũ nào. Nếu cần đưa các thông tin này vào phiên bản xuất bản, đội ngũ kho cần bổ sung dữ liệu kiểm đếm đã được xác nhận.</p>
<h2>Sắp xếp lại vị trí để dễ tìm và dễ lấy</h2>
<p>Khi không gian kho rộng hơn được nhìn theo từng cụm, việc sắp xếp không chỉ là “để gọn”. Các cụm lốp được tách thành khu vực rõ hơn giúp người làm việc có điểm tham chiếu khi tìm đồ. Điều này đặc biệt hữu ích khi cần trao đổi trong kho: thay vì mô tả bằng một góc chung chung, có thể xác định khu vực gần lối đi hoặc khu vực đặt mâm/bánh.</p>
${image('kho-lop-theo-cum-01.jpg', 'Các cột lốp xe nâng trong không gian kho mái tôn', 'Các lốp được nhìn thấy theo từng cột trong không gian kho.')}
<p>Phần này không khẳng định một quy trình cố định cho mọi kho phụ tùng xe nâng. Cách bố trí cuối cùng còn cần phù hợp với sơ đồ kho, danh sách hàng và cách vận hành thực tế. Tư liệu Ngày 2 mới cho thấy ý định làm rõ các khu vực, chưa đủ để kết luận về năng lực lưu trữ hay quy tắc vận hành.</p>
<h2>Từ trước khi dọn đến sau khi sắp xếp</h2>
<p>Mô tả của các ảnh theo thứ tự kể chuyện cho thấy sự chuyển tiếp từ khu vực chứa dày sang các cột hoặc cụm lốp rõ ràng hơn, đồng thời lối đi trông thông thoáng hơn. Đây là thay đổi có thể nói ở mức quan sát không gian. Nó không đồng nghĩa với việc mọi hạng mục đã hoàn thành, cũng không thay thế bước kiểm tra lại sau khi dọn.</p>
${image('cot-lop-sau-sap-xep-01.jpg', 'Các cột lốp xe nâng trong khu vực kho sau khi được sắp xếp theo cụm', 'Các cột lốp trong khu vực kho, với khoảng sàn trống ở phía trước.')}
<h2>Một ngày dọn kho thực tế diễn ra như thế nào</h2>
<p>Một ngày dọn kho thực tế thường có nhiều bước nhỏ: nhìn lại khu vực đang vướng, thống nhất chỗ đặt tạm, gom đồ về từng cụm, chừa đường đi rồi quay lại quan sát toàn bộ. Phần khó không nằm ở câu chữ; nằm ở việc không để các quyết định trong lúc dọn làm mất dấu vị trí của vật tư. Vì thế, việc chụp ảnh theo từng thời điểm là tư liệu hữu ích cho người biên tập và người phụ trách kho cùng nhìn lại.</p>
<p>Trong chuỗi này, Ngày 2 chỉ là một lát cắt về khu vực lốp và mâm. Tư liệu của các ngày khác cần được đưa vào sau khi có file thực tế, thay vì gộp mọi diễn biến thành một câu chuyện hoàn chỉnh khi chưa có bằng chứng.</p>
<h2>Sau khi sắp xếp, kho thay đổi gì</h2>
<p>Thay đổi dễ thấy nhất theo mô tả tư liệu là các cụm lốp được nhận diện rõ hơn và phần đi lại được mở hơn. Đây là cơ sở để tiếp tục kiểm tra cách đặt vật tư, bổ sung nhãn hoặc hoàn thiện sơ đồ khi có dữ liệu vận hành. Bài viết không tuyên bố rằng kho đã đạt tiêu chuẩn an toàn, hiệu suất hay chất lượng nào vì chưa có hồ sơ xác nhận cho các kết luận đó.</p>
${image('loi-di-kho-sau-sap-xep-01.jpg', 'Lối đi dọc kho cạnh các cột lốp và mâm xe nâng', 'Góc nhìn dài của kho với các cụm lốp/mâm đặt dọc theo một bên lối đi.')}
<p>Người đọc đang tìm hiểu mâm xe nâng có thể xem <a href="/mam-xe-nang">trang mâm xe nâng</a>; người cần xem nhóm sản phẩm công khai có thể đi tới <a href="/products">danh mục sản phẩm và dịch vụ</a>. Các liên kết này là route đang có của website và được đặt theo đúng ngữ cảnh, không nhằm chèn từ khóa máy móc.</p>
<h2>Kết lại ngày dọn kho thứ hai</h2>
<p>Ngày 2 là bước sắp xếp lại cách nhìn về khu vực lốp và mâm trong kho: gom thành từng cụm, nhìn rõ lối đi hơn và để công việc tiếp theo có điểm bắt đầu cụ thể. Năm ảnh đã được gắn đúng ngữ cảnh kể chuyện; bài vẫn cần được con người duyệt trước khi xuất bản.</p>
<p>Nếu cần trao đổi về lốp xe nâng, mâm xe nâng hoặc phụ tùng xe nâng phù hợp với nhu cầu thực tế, hãy chuẩn bị thông tin hiện có để đội ngũ có thể đối chiếu trước khi tư vấn.</p>`;

async function main() {
  const existing = await db.post.findUnique({ where: { slug } });
  const postData = {
    title: 'Ngày Dọn Kho Thứ 2: Sắp Xếp Lại Kho Lốp Và Mâm Xe Nâng',
    slug,
    excerpt: 'Ghi nhận Ngày 2 của chuỗi dọn kho: sắp xếp lại khu vực lốp, mâm và lối đi theo những quan sát thực tế được cung cấp.',
    content,
    tableOfContents: [
      { title: 'Bắt đầu từ một kho lốp chưa thật sự gọn', anchor: 'bat-dau-tu-mot-kho-lop-chua-that-su-gon' },
      { title: 'Phân loại lại lốp, mâm và các vật tư', anchor: 'phan-loai-lai-lop-mam-va-cac-vat-tu' },
      { title: 'Sắp xếp lại vị trí để dễ tìm và dễ lấy', anchor: 'sap-xep-lai-vi-tri-de-de-tim-va-de-lay' },
      { title: 'Sau khi sắp xếp, kho thay đổi gì', anchor: 'sau-khi-sap-xep-kho-thay-doi-gi' },
    ],
    seo: {
      title: 'Ngày Dọn Kho Thứ 2: Sắp Xếp Lại Kho Lốp Và Mâm Xe Nâng',
      description: 'Ghi nhận Ngày 2 dọn kho: sắp xếp lại khu vực lốp xe nâng, mâm và lối đi theo tư liệu thực tế được cung cấp.',
      primaryKeyword: 'lốp xe nâng',
      secondaryKeywords: ['mâm xe nâng', 'vành xe nâng', 'kho lốp xe nâng', 'lốp xe nâng cũ', 'mâm xe nâng cũ', 'dọn kho', 'phụ tùng xe nâng'],
      keywords: ['lốp xe nâng', 'mâm xe nâng', 'vành xe nâng', 'kho lốp xe nâng', 'lốp xe nâng cũ', 'mâm xe nâng cũ', 'dọn kho', 'phụ tùng xe nâng'],
      openGraph: { title: 'Ngày Dọn Kho Thứ 2: Sắp Xếp Lại Kho Lốp Và Mâm Xe Nâng', description: 'Ghi nhận Ngày 2 dọn kho, đang chờ ảnh gốc trước khi xuất bản.', type: 'article' },
      twitter: { card: 'summary_large_image', title: 'Ngày Dọn Kho Thứ 2', description: 'Bản nháp ghi nhận Ngày 2 dọn kho.' },
      imageUrl: `${mediaBase}/kho-cu-mam-lop-01.jpg`,
      imageAlt: 'Khu vực kho cũ có nhiều mâm và lốp xe nâng được đặt dày',
      contentImages: [
        { url: `${mediaBase}/kho-cu-mam-lop-01.jpg`, alt: 'Khu vực kho cũ có nhiều mâm và lốp xe nâng được đặt dày' },
        { url: `${mediaBase}/kho-cu-mam-lop-02.jpg`, alt: 'Góc nhìn sâu trong khu vực có nhiều mâm và lốp xe nâng' },
        { url: `${mediaBase}/kho-lop-theo-cum-01.jpg`, alt: 'Các cột lốp xe nâng trong không gian kho mái tôn' },
        { url: `${mediaBase}/cot-lop-sau-sap-xep-01.jpg`, alt: 'Các cột lốp xe nâng trong khu vực kho sau khi được sắp xếp theo cụm' },
        { url: `${mediaBase}/loi-di-kho-sau-sap-xep-01.jpg`, alt: 'Lối đi dọc kho cạnh các cột lốp và mâm xe nâng' },
      ],
      robots: 'noindex,follow',
    },
    tags: ['dọn kho', 'lốp xe nâng', 'mâm xe nâng', 'phụ tùng xe nâng', 'chuyển kho 2026'],
    status: ContentStatus.DRAFT,
  };
  const post = existing
    ? await posts.update(existing.id, postData)
    : await posts.create(postData);
  const campaign = await db.contentCampaign.findUnique({ where: { slug: 'chuyen-kho-2026' } });
  if (campaign) await db.campaignPost.upsert({
    where: { campaignId_postId: { campaignId: campaign.id, postId: post.id } },
    update: {},
    create: { campaignId: campaign.id, postId: post.id, sortOrder: 5, notes: 'Ngày 2: chờ 5 ảnh gốc và video (nếu có) trước khi hoàn thiện/publish.' },
  });
  console.log(JSON.stringify({ id: post.id, slug: post.slug, status: post.status, campaignLinked: Boolean(campaign) }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
