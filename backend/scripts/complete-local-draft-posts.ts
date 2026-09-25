import { ContentStatus, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type Section = { title: string; body: string };
type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  keyword: string;
  description: string;
  tags: string[];
  sections: Section[];
  checklist?: string[];
};

const paragraph = (value: string) => `<p>${value}</p>`;
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function contentFor(draft: Draft) {
  const sections = draft.sections.map(({ title, body }) => `<h2 id="${slugify(title)}">${title}</h2>${body.split('\n\n').map(paragraph).join('')}`).join('');
  const checklist = draft.checklist?.length ? `<h2 id="danh-sach-can-chuan-bi">Danh sách cần chuẩn bị</h2><ul>${draft.checklist.map((item) => `<li>${item}</li>`).join('')}</ul>` : '';
  return `<p>${draft.excerpt} Bài viết này giúp bạn xác định thông tin cần xem xét trước khi chọn sản phẩm hoặc trao đổi với đơn vị kỹ thuật. Nội dung chỉ mang tính tham khảo; cấu hình cuối cùng cần được đối chiếu trên xe, bánh xe và điều kiện vận hành thực tế.</p>${sections}${checklist}<h2 id="buoc-tiep-theo">Bước tiếp theo</h2><p>Sau khi đã có thông tin ban đầu, bạn có thể xem nhóm <a href="/vo-xe-nang">vỏ xe nâng</a>, tham khảo <a href="/mam-xe-nang">mâm xe nâng</a> hoặc liên hệ để được đối chiếu cấu hình. Không nên đặt lốp hay mâm chỉ dựa vào ảnh minh họa hoặc tên gọi thông thường.</p>`;
}

const drafts: Draft[] = [
  {
    slug: 'ke-hoach-noi-dung-lop-dac-xe-nang-so-sanh', title: 'Lốp đặc xe nâng: cách so sánh trước khi lựa chọn', keyword: 'lốp đặc xe nâng',
    excerpt: 'Hướng dẫn so sánh lốp đặc xe nâng theo điều kiện làm việc, cấu hình bánh và kế hoạch bảo trì thay vì chỉ nhìn vào giá hoặc tên thương hiệu.',
    description: 'Cách so sánh lốp đặc xe nâng theo môi trường vận hành, kích thước, mâm và dữ liệu cần xác nhận trước khi thay.', tags: ['lốp đặc xe nâng', 'so sánh lốp xe nâng', 'vỏ xe nâng'],
    sections: [
      { title: 'Lốp đặc phù hợp trong trường hợp nào?', body: 'Lốp đặc thường được người vận hành cân nhắc cho xe làm việc trong kho, xưởng hoặc mặt bằng tương đối ổn định. Điểm cần đánh giá không phải là lời hứa chung chung về độ bền, mà là nhịp chạy xe, tải hàng, các điểm quay đầu và tình trạng nền tại nơi xe hoạt động.\n\nNếu xe thường xuyên đi qua nền gồ ghề, ram dốc hoặc khu vực ngoài trời, cần trao đổi rõ điều kiện này khi so sánh. Mỗi môi trường tạo ra yêu cầu khác nhau với bánh xe, mâm và cách vận hành.' },
      { title: 'So sánh đúng bắt đầu từ cấu hình đang dùng', body: 'Hãy đọc ký hiệu trên hông lốp hiện tại và chụp ảnh rõ cả bánh xe. Kích thước, kiểu mâm, vị trí bánh trước hay sau và tình trạng bánh còn lại trên cùng trục đều có ý nghĩa khi tư vấn. Tên xe hoặc hình ảnh trên mạng không đủ để thay thế bước đối chiếu này.\n\nKhi lốp cũ mòn lệch, xe rung hoặc có cảm giác kéo lái, nguyên nhân có thể liên quan đến mâm, hệ thống lái hoặc cách sử dụng. Thay riêng lốp mới mà không kiểm tra hiện trạng có thể không xử lý được vấn đề gốc.' },
      { title: 'Đừng so sánh chỉ bằng giá ban đầu', body: 'Một báo giá cần được đọc cùng phạm vi công việc: loại lốp, khả năng tương thích với mâm, thao tác ép/lắp nếu có và các hạng mục cần kiểm tra sau lắp đặt. Giá phù hợp là giá đi cùng cấu hình phù hợp, không phải một con số tách rời khỏi điều kiện vận hành.\n\nHãy yêu cầu giải thích rõ thông tin nào đang là dữ liệu đã xác nhận và thông tin nào còn cần xem trực tiếp. Cách làm này giúp cuộc trao đổi minh bạch hơn và giảm nguy cơ chọn sai.' },
      { title: 'Theo dõi sau khi thay lốp', body: 'Sau khi lắp, xe nên được chạy thử ở tốc độ thấp trong khu vực an toàn. Quan sát độ ổn định khi đi thẳng, khi đánh lái và khi làm việc theo tải thường dùng. Bất kỳ dấu hiệu rung, cọ sát hoặc vận hành bất thường nào cũng nên được ghi nhận sớm.\n\nViệc lưu ngày thay, vị trí bánh và ảnh hiện trạng ban đầu giúp lần kiểm tra sau có cơ sở đối chiếu. Đây là thói quen hữu ích cho đội xe dù sử dụng lốp đặc hay loại lốp khác.' },
    ], checklist: ['Ảnh hông lốp và toàn bộ bánh xe hiện tại.', 'Kích thước/ký hiệu đọc được trên lốp.', 'Vị trí bánh và kiểu mâm đang sử dụng.', 'Mô tả mặt bằng, tải hàng và hiện tượng bất thường nếu có.'],
  },
  {
    slug: 'ke-hoach-noi-dung-vo-mam-xe-nang-tong-quan', title: 'Vỏ mâm xe nâng: hiểu đúng để xác định nhu cầu ban đầu', keyword: 'vỏ mâm xe nâng',
    excerpt: 'Tổng quan về cách nhìn vỏ/lốp và mâm xe nâng như một cụm cần được đối chiếu cùng nhau trước khi thay thế hoặc tư vấn.',
    description: 'Tìm hiểu vỏ mâm xe nâng: các thông tin cần kiểm tra trên lốp, mâm và điều kiện vận hành trước khi chọn phương án.', tags: ['vỏ mâm xe nâng', 'vỏ xe nâng', 'mâm xe nâng'],
    sections: [
      { title: 'Vỏ và mâm cần được xem như một cụm', body: 'Bánh xe nâng không chỉ là phần lốp nhìn thấy bên ngoài. Lốp/vỏ, mâm, vị trí lắp và tình trạng liên kết cùng ảnh hưởng đến cảm giác vận hành. Vì thế, khi cần thay một hạng mục, hãy cung cấp thông tin của cả cụm bánh xe thay vì chỉ gửi tên sản phẩm mong muốn.\n\nViệc này đặc biệt quan trọng với xe đã qua nhiều lần bảo trì. Cấu hình thực tế có thể khác với dữ liệu ghi nhớ hoặc thông tin của một dòng xe tương tự.' },
      { title: 'Những dấu hiệu cần ghi nhận', body: 'Mòn không đều, nứt hông lốp, dấu hiệu va chạm ở mâm, xe rung hoặc lái nặng là những hiện tượng nên mô tả rõ khi trao đổi. Bài viết không dùng các dấu hiệu này để chẩn đoán từ xa; chúng là dữ liệu đầu vào giúp kỹ thuật viên biết phần nào cần kiểm tra.\n\nChụp ảnh từ nhiều góc, bao gồm hông lốp, mép mâm và vị trí bánh trên xe, thường hữu ích hơn một ảnh cận cảnh duy nhất.' },
      { title: 'Xác định nhu cầu theo công việc thực tế', body: 'Kho kín, khu đóng gói, sân bãi hoặc đường nội bộ có thể tạo các yêu cầu vận hành khác nhau. Hãy mô tả lộ trình xe thường đi, tần suất làm việc, tải sử dụng và các vị trí có dốc hoặc gờ. Những thông tin này giúp thu hẹp phương án phù hợp mà không suy diễn từ một bức ảnh kho.\n\nNếu cần thay theo cặp trên cùng trục, hiện trạng bánh còn lại cũng cần được đưa vào đánh giá để có kế hoạch đồng bộ.' },
      { title: 'Tư vấn tốt cần có bước xác nhận', body: 'Thông tin trong bài là điểm khởi đầu chứ không phải thông số kỹ thuật thay thế cho xe của bạn. Trước khi chốt phương án, cần xác nhận kích thước, kiểu mâm và các yếu tố liên quan trực tiếp từ hiện vật hoặc hồ sơ kỹ thuật đáng tin cậy.\n\nCách làm này bảo vệ cả người sử dụng lẫn đơn vị cung cấp, bởi quyết định dựa trên dữ liệu rõ ràng sẽ dễ kiểm tra lại hơn.' },
    ], checklist: ['Ảnh lốp, mâm và vị trí bánh trên xe.', 'Thông tin xe nâng và môi trường hoạt động.', 'Mô tả hiện tượng rung, mòn lệch hoặc va chạm (nếu có).'],
  },
  {
    slug: 'mam-xe-nang-va-banh-xe-nang-dinh-huong-lien-he', title: 'Mâm xe nâng và bánh xe nâng: chuẩn bị gì trước khi liên hệ?', keyword: 'mâm xe nâng',
    excerpt: 'Cách chuẩn bị ảnh, kích thước và mô tả hiện trạng để cuộc trao đổi về mâm xe nâng hoặc bánh xe nâng chính xác hơn.',
    description: 'Hướng dẫn chuẩn bị thông tin khi cần tư vấn mâm xe nâng và bánh xe nâng, từ ảnh hiện trạng đến vị trí lắp.', tags: ['mâm xe nâng', 'bánh xe nâng', 'tư vấn xe nâng'],
    sections: [
      { title: 'Vì sao không nên gọi tên mâm theo cảm tính?', body: 'Mâm xe nâng có thể được gọi bằng nhiều cách trong thực tế, trong khi khả năng lắp phụ thuộc vào kích thước, kết cấu và cấu hình đang dùng. Chỉ nói “mâm xe nâng” hoặc gửi một ảnh xa thường chưa đủ để xác định phương án.\n\nHãy ưu tiên đối chiếu mâm đang lắp trên xe. Nếu có ký hiệu, hãy chụp rõ; nếu không, ảnh thẳng mặt mâm, mép mâm và vị trí liên quan vẫn giúp việc nhận diện tốt hơn.' },
      { title: 'Thông tin nên gửi ngay từ đầu', body: 'Một bộ thông tin cơ bản nên gồm ảnh tổng thể bánh xe, ảnh hông lốp, ảnh mặt và mép mâm, vị trí bánh trước/sau cùng mô tả xe đang gặp vấn đề gì. Nếu xe từng va chạm hoặc bánh có độ đảo, hãy ghi rõ thay vì chỉ yêu cầu một mã hàng.\n\nKhông nên đoán số lỗ bu-lông, kích thước hoặc độ tương thích khi chưa kiểm tra. Dữ liệu chưa chắc chắn cần được ghi là “cần xác nhận”.' },
      { title: 'Khi nào cần kiểm tra cả lốp?', body: 'Mâm và lốp làm việc cùng nhau, nên một yêu cầu liên quan đến mâm có thể cần nhìn thêm tình trạng lốp. Mép mâm hư hại, lốp có dấu hiệu cọ sát hoặc độ mòn khác thường đều là lý do để kiểm tra đồng thời.\n\nViệc xem cả bánh còn lại trên cùng trục cũng giúp nhận ra liệu cần một phương án đơn lẻ hay kế hoạch xử lý theo cặp.' },
      { title: 'Lưu ý sau khi lắp đặt', body: 'Sau bất kỳ thay đổi nào ở cụm bánh xe, cần chạy thử an toàn và quan sát lại. Không bỏ qua cảm giác rung, tiếng bất thường hay xe mất ổn định; đây là các thông tin cần phản hồi để được kiểm tra tiếp.\n\nGhi nhận hiện trạng bằng ảnh và thời điểm lắp đặt sẽ giúp lần bảo trì sau có dữ liệu rõ ràng hơn.' },
    ], checklist: ['Ảnh mặt mâm, mép mâm, hông lốp và toàn bộ bánh.', 'Vị trí bánh trên xe và thông tin dòng xe nếu có.', 'Mô tả hiện tượng vận hành cần xử lý.'],
  },
  {
    slug: 'chuan-bi-thong-tin-khi-can-tu-van-vo-xe-nang', title: 'Cách chuẩn bị thông tin khi cần tư vấn vỏ xe nâng', keyword: 'vỏ xe nâng',
    excerpt: 'Một checklist thực tế giúp bạn chuẩn bị thông tin trước khi tư vấn vỏ xe nâng, hạn chế việc chọn nhầm kích thước hoặc cấu hình.',
    description: 'Checklist chuẩn bị thông tin khi cần tư vấn vỏ xe nâng: ảnh hông lốp, mâm, vị trí bánh và điều kiện làm việc.', tags: ['vỏ xe nâng', 'tư vấn vỏ xe nâng', 'thay lốp xe nâng'],
    sections: [
      { title: 'Bắt đầu bằng ảnh rõ thay vì mô tả chung', body: 'Ảnh hông lốp cũ là dữ liệu hữu ích vì có thể cho thấy kích thước và các ký hiệu đang sử dụng. Hãy chụp ở nơi đủ sáng, tránh che mất phần chữ; bổ sung một ảnh toàn cảnh bánh xe để người tư vấn thấy vị trí lắp.\n\nNếu chữ trên lốp đã mờ, không nên tự suy đoán. Gửi ảnh cùng thông tin xe và mâm sẽ tạo điều kiện cho bước kiểm tra tiếp theo.' },
      { title: 'Ghi nhận vị trí và hiện trạng bánh', body: 'Bánh trước, bánh sau và bánh còn lại trên cùng trục có thể đang có tình trạng khác nhau. Hãy nói rõ bánh nào cần thay và xe đang có hiện tượng gì: mòn lệch, rung, mất áp với lốp hơi, cọ sát hoặc dấu hiệu khác.\n\nMô tả này không thay thế kiểm tra kỹ thuật, nhưng giúp cuộc tư vấn không bị giới hạn ở một kích thước rời rạc.' },
      { title: 'Nói rõ điều kiện vận hành', body: 'Xe làm việc trong kho, trên sân bãi, qua ram dốc hay nền không đồng đều sẽ có bối cảnh sử dụng khác nhau. Tần suất xe chạy, tải thường dùng và những điểm xe hay quay đầu cũng là thông tin giá trị.\n\nKhông cần tự kết luận loại lốp nào phù hợp. Chỉ cần mô tả đúng những gì đang diễn ra để đơn vị tư vấn đối chiếu.' },
      { title: 'Xác nhận trước khi đặt hàng', body: 'Trước khi chốt, cần thống nhất lại kích thước, số lượng, vị trí thay, cấu hình mâm và phần việc lắp đặt nếu có. Một báo giá rõ ràng cần cho biết phạm vi đang được xác nhận dựa trên thông tin nào.\n\nNếu còn điểm chưa rõ, hãy coi đó là hạng mục cần kiểm tra chứ không phải lý do để đưa ra lựa chọn vội vàng.' },
    ], checklist: ['Ảnh hông lốp có ký hiệu, ảnh toàn bộ bánh và mâm.', 'Vị trí bánh cần thay, tình trạng bánh còn lại cùng trục.', 'Mô tả xe, tải sử dụng và mặt bằng vận hành.', 'Thông tin hiện tượng bất thường nếu đang xảy ra.'],
  },
  {
    slug: 'lop-xe-nang-giai-thich-thuat-ngu-cho-nguoi-moi', title: 'Lốp xe nâng: các thuật ngữ cơ bản cho người mới', keyword: 'lốp xe nâng',
    excerpt: 'Giải thích các khái niệm thường gặp khi tìm hiểu lốp xe nâng, đồng thời chỉ ra những thông tin vẫn cần xác nhận trên xe thực tế.',
    description: 'Tìm hiểu thuật ngữ cơ bản về lốp xe nâng: kích thước, hông lốp, mâm, vị trí bánh và cách dùng thông tin đúng cách.', tags: ['lốp xe nâng', 'thuật ngữ lốp xe nâng', 'vỏ xe nâng'],
    sections: [
      { title: 'Lốp, vỏ và bánh xe nâng', body: 'Trong giao tiếp hằng ngày, “lốp” và “vỏ” có thể được dùng để chỉ phần cao su tiếp xúc với mặt đường. “Bánh xe” đôi khi được dùng cho cả cụm lốp và mâm. Vì cách gọi có thể khác nhau, ảnh thực tế và ký hiệu trên hông lốp luôn là cách đối chiếu đáng tin cậy hơn.\n\nKhi trao đổi, bạn có thể dùng từ quen thuộc nhưng nên kèm mô tả rõ phần nào đang cần kiểm tra hoặc thay thế.' },
      { title: 'Kích thước và ký hiệu trên hông lốp', body: 'Hông lốp thường có các ký hiệu nhận diện cấu hình. Đây là dữ liệu để bắt đầu tra cứu, không phải giấy phép để thay thế mà không kiểm tra các yếu tố khác. Ký hiệu có thể mờ, bị che hoặc không phản ánh toàn bộ cấu hình đã thay đổi trên xe.\n\nChụp rõ phần ký hiệu giúp giảm sai sót khi truyền đạt. Đừng tự điền thông số theo trí nhớ nếu không chắc chắn.' },
      { title: 'Mâm và vị trí bánh', body: 'Mâm là phần kim loại liên kết với lốp trong cụm bánh xe. Kiểu mâm, tình trạng mép mâm và vị trí bánh trên xe là các dữ liệu liên quan trực tiếp đến việc thay thế/lắp đặt.\n\nCùng một cách gọi lốp không có nghĩa mọi mâm đều giống nhau. Vì vậy, tư vấn có trách nhiệm luôn cần nhìn cả mâm hoặc có thông tin xác nhận về nó.' },
      { title: 'Cách dùng bài viết này', body: 'Mục đích của các thuật ngữ là giúp bạn đặt đúng câu hỏi, không phải để tự chẩn đoán hay tự xác nhận độ tương thích. Khi gặp hiện tượng vận hành bất thường, hãy lưu ảnh, ghi nhận bối cảnh và trao đổi với người có chuyên môn.\n\nTừ một vài thuật ngữ cơ bản, bạn sẽ dễ chuẩn bị thông tin hơn khi tìm kiếm sản phẩm hoặc yêu cầu tư vấn.' },
    ], checklist: ['Ảnh hông lốp có ký hiệu.', 'Ảnh mâm và vị trí bánh.', 'Ghi chú các từ/ký hiệu chưa rõ để đối chiếu.'],
  },
  {
    slug: 'video-ngay-1-khu-vuc-dat-vo-lop-trong-kho', title: 'Video Ngày 1: ghi nhận khu vực đặt vỏ lốp trong kho', keyword: 'vỏ mâm xe nâng',
    excerpt: 'Ghi nhận từ video Ngày 1 về khu vực có các chồng vỏ/lốp xe nâng trong kho; nội dung chỉ mô tả những gì tư liệu thể hiện.',
    description: 'Video Ngày 1 ghi nhận khu vực đặt vỏ/lốp xe nâng trong kho. Bài không suy diễn số lượng, chất lượng hay tình trạng hàng.', tags: ['chuyển kho 2026', 'video ngày 1', 'vỏ mâm xe nâng'],
    sections: [
      { title: 'Phạm vi của tư liệu video', body: 'Video Ngày 1 ghi nhận một khu vực có các chồng vỏ/lốp xe nâng trong không gian kho. Đây là tư liệu quan sát, không phải phiếu kiểm kê, hồ sơ chất lượng hay báo cáo an toàn.\n\nViệc tách rõ phạm vi giúp người xem không suy ra số lượng hàng, xuất xứ, tình trạng kỹ thuật hoặc khả năng đáp ứng từ khung hình.' },
      { title: 'Những gì có thể quan sát', body: 'Khung hình cho thấy khu vực đặt các chồng vỏ/lốp và phần không gian kho xung quanh. Tư liệu hữu ích để lưu lại bối cảnh ban đầu của chiến dịch chuyển kho và làm tham chiếu khi đội ngũ tiếp tục sắp xếp.\n\nTuy nhiên, hình ảnh không thể thay thế cho việc đọc ký hiệu, phân loại, kiểm đếm hoặc xác nhận sản phẩm.' },
      { title: 'Cách sử dụng tư liệu có trách nhiệm', body: 'Video được dùng để kể lại diễn biến thực tế, với chú thích phản ánh đúng nội dung nhìn thấy. Nếu cần bổ sung phụ đề, mốc thời gian hoặc thông tin nghiệp vụ, các chi tiết đó phải được người phụ trách xác nhận trước khi công bố.\n\nBài viết giữ trạng thái nháp để phần tư liệu và nội dung biên tập có thể được duyệt cùng nhau.' },
      { title: 'Liên hệ với công việc tiếp theo', body: 'Sau khi ghi nhận hiện trạng, đội ngũ có thể dùng tư liệu để xác định những khu vực cần quan sát lại, sắp xếp lại hoặc kiểm kê theo quy trình riêng. Mọi kết quả của bước sau nên được ghi nhận bằng dữ liệu độc lập, không suy diễn trực tiếp từ video.\n\nNgười đọc cần tư vấn sản phẩm nên cung cấp ảnh và thông tin cấu hình thực tế thay vì dùng hình ảnh kho làm căn cứ chọn hàng.' },
    ], checklist: ['Xác nhận người phụ trách đã duyệt video và chú thích.', 'Bổ sung phụ đề chỉ khi có nội dung được xác minh.', 'Không dùng video để suy ra số lượng hoặc tình trạng hàng.'],
  },
  {
    slug: 'ghi-nhan-loi-di-kho-ngay-dau-chuyen-doi', title: 'Ghi nhận lối đi kho trong ngày đầu chuyển đổi', keyword: 'kho vỏ lốp xe nâng',
    excerpt: 'Ghi nhận Ngày 1 về lối đi kho cạnh các chồng vỏ/lốp xe nâng, giới hạn ở những quan sát từ tư liệu được cung cấp.',
    description: 'Ghi nhận lối đi kho trong Ngày 1 chuyển đổi. Nội dung chỉ mô tả tư liệu, không kết luận tiêu chuẩn an toàn hay năng lực kho.', tags: ['chuyển kho 2026', 'nhật ký ngày 1', 'kho vỏ lốp xe nâng'],
    sections: [
      { title: 'Góc nhìn từ lối đi kho', body: 'Tư liệu Ngày 1 ghi nhận một lối đi dẫn về phía cửa kho, cạnh các chồng vỏ/lốp xe nâng. Lối đi là phần quan trọng để quan sát cách không gian được sử dụng trong thời điểm ghi hình.\n\nBài không đánh giá lối đi đạt hay không đạt một tiêu chuẩn cụ thể. Những kết luận như vậy cần đo đạc, quy định áp dụng và người có trách nhiệm xác nhận.' },
      { title: 'Điều tư liệu không thể xác nhận', body: 'Từ ảnh hoặc video, không thể kết luận số lượng hàng, tải trọng, lịch sử di chuyển, độ an toàn hoặc hiệu quả vận hành của kho. Vệt trên nền và vị trí các cụm lốp chỉ là chi tiết thị giác tại thời điểm ghi nhận.\n\nViệc nêu giới hạn này giúp nhật ký chuyển kho giữ được giá trị làm tư liệu thay vì trở thành một nhận định thiếu cơ sở.' },
      { title: 'Vai trò của ghi nhận ban đầu', body: 'Ghi nhận ban đầu tạo một mốc để đội ngũ nhìn lại quá trình sau này. Khi có kế hoạch sắp xếp, ảnh trước và sau có thể hỗ trợ việc trao đổi nội bộ về các khu vực, miễn là chú thích đúng những gì đã xảy ra.\n\nNếu có thay đổi liên quan đến quy trình, chúng nên được ghi ở tài liệu vận hành và có người phụ trách phê duyệt.' },
      { title: 'Thông tin cần có để đánh giá tiếp', body: 'Để đưa ra quyết định về bố trí kho, cần thêm sơ đồ, danh sách vật tư, cách di chuyển thực tế và các yêu cầu an toàn tại cơ sở. Những dữ liệu này không có trong khung tư liệu Ngày 1.\n\nBài viết vì vậy chỉ là một trang ghi nhận, không phải hướng dẫn vận hành kho.' },
    ], checklist: ['Giữ ảnh/video gốc kèm ngày ghi nhận.', 'Phân biệt rõ quan sát thị giác với dữ liệu kiểm kê.', 'Xin xác nhận trước khi nêu thông tin về quy trình hoặc tiêu chuẩn.'],
  },
  {
    slug: 'nhat-ky-ngay-1-chong-vo-lop-trong-kho', title: 'Nhật ký Ngày 1: ghi nhận các chồng vỏ lốp trong kho', keyword: 'vỏ xe nâng',
    excerpt: 'Nhật ký hình ảnh Ngày 1 tập trung vào các chồng vỏ/lốp xe nâng trong kho và giới hạn nội dung ở quan sát từ tư liệu.',
    description: 'Nhật ký Ngày 1 ghi nhận các chồng vỏ/lốp xe nâng trong kho; không xác nhận số lượng, chủng loại hoặc tình trạng kỹ thuật.', tags: ['chuyển kho 2026', 'nhật ký ngày 1', 'vỏ xe nâng'],
    sections: [
      { title: 'Những chồng vỏ/lốp trong tư liệu', body: 'Hình ảnh Ngày 1 cho thấy nhiều chồng vỏ/lốp xe nâng được đặt trong không gian kho mái tôn. Đây là điểm quan sát chính của bài nhật ký và là bối cảnh cho công việc chuyển đổi/sắp xếp tiếp theo.\n\nMỗi chồng lốp nhìn thấy không đồng nghĩa với một chủng loại, kích thước hoặc tình trạng đã được xác nhận. Các dữ liệu đó cần đến kiểm đếm và phân loại riêng.' },
      { title: 'Từ hình ảnh đến dữ liệu kho', body: 'Ảnh có ích cho việc ghi nhận thời điểm và vị trí tương đối, nhưng không thay thế cho nhãn hàng, mã hàng hoặc hồ sơ kiểm kê. Khi làm việc với kho, hai loại thông tin này cần được tách bạch để tránh nhầm lẫn.\n\nNếu sau này có kiểm đếm, kết quả nên được công bố dựa trên danh sách được xác minh, không dựa vào ước lượng từ ảnh.' },
      { title: 'Vì sao cần ghi nhận đúng mức?', body: 'Một nhật ký đáng tin cậy không cố nói nhiều hơn bằng chứng. Ghi nhận đúng mức giúp hình ảnh kho giữ được giá trị đối chiếu cho đội ngũ mà không tạo kỳ vọng sai về tình trạng hàng.\n\nChú thích ảnh cũng nên nêu rõ đây là tư liệu Ngày 1 và không dùng các từ khẳng định về chất lượng hoặc nguồn gốc nếu chưa có hồ sơ.' },
      { title: 'Bước tiếp theo của chuỗi tư liệu', body: 'Các ngày tiếp theo có thể ghi nhận việc gom cụm, tạo lối đi hoặc kiểm tra khu vực. Mỗi bước nên có tư liệu riêng và được biên tập độc lập theo những gì thực sự được cung cấp.\n\nCách làm này tạo một chuỗi minh bạch, thay vì ghép các giai đoạn thành một câu chuyện không có bằng chứng.' },
    ], checklist: ['Lưu ảnh gốc và mô tả thời điểm ghi nhận.', 'Không dùng ảnh để xác nhận số lượng hoặc phân loại hàng.', 'Đối chiếu thông tin sản phẩm bằng dữ liệu kiểm kê độc lập.'],
  },
  {
    slug: 'tu-lieu-ngay-1-goc-kho-va-vo-lop-xe-nang', title: 'Tư liệu Ngày 1: một góc kho và khu vực đặt vỏ lốp xe nâng', keyword: 'lốp xe nâng',
    excerpt: 'Tư liệu Ngày 1 ghi nhận một góc kho cùng khu vực đặt vỏ/lốp xe nâng; bài viết mô tả cảnh quan sát được, không suy diễn dữ liệu hàng hóa.',
    description: 'Tư liệu Ngày 1 về một góc kho và khu vực đặt vỏ/lốp xe nâng. Nội dung không thay thế kiểm kê hay đánh giá kỹ thuật.', tags: ['chuyển kho 2026', 'tư liệu ngày 1', 'lốp xe nâng'],
    sections: [
      { title: 'Một góc kho trong Ngày 1', body: 'Tư liệu ghi nhận một góc kho mái tôn, các chồng vỏ/lốp xe nâng và một số chi tiết của khu vực xung quanh tại thời điểm chụp. Giá trị chính của hình ảnh là lưu lại không gian ban đầu.\n\nBài viết không diễn giải các chi tiết đó thành thông tin về tồn kho, nguồn gốc hàng hoặc năng lực cung ứng. Những kết luận này cần dữ liệu khác.' },
      { title: 'Quan sát và xác nhận là hai việc khác nhau', body: 'Có thể quan sát vị trí tương đối của vật tư trong ảnh, nhưng không thể khẳng định chính xác kích thước, thương hiệu, số lượng hoặc chất lượng của chúng. Hình ảnh là một nguồn tư liệu, không phải toàn bộ hồ sơ.\n\nKhi cần thông tin sản phẩm, người dùng nên đối chiếu trên hông lốp, mâm hoặc dữ liệu catalog đã được xác nhận.' },
      { title: 'Cách chú thích tư liệu kho', body: 'Chú thích tốt nêu rõ ngày, khu vực và nội dung có thể nhìn thấy mà không thêm các chi tiết không có bằng chứng. Ví dụ, có thể nói “các chồng vỏ/lốp trong kho”, thay vì đưa ra phỏng đoán về tuổi lốp hay tình trạng sử dụng.\n\nCách viết này bảo vệ tính chính xác của tư liệu và giúp người xem hiểu đúng phạm vi của bài.' },
      { title: 'Dùng tư liệu cho quá trình chuyển đổi', body: 'Tư liệu ban đầu có thể hỗ trợ đội ngũ trao đổi về các khu vực cần sắp xếp tiếp, cũng như tạo mốc so sánh khi có hình ảnh mới. Mọi thay đổi sau đó cần được ghi nhận đúng thời điểm và kèm dữ liệu vận hành khi cần thiết.\n\nBài hiện là bản nháp để các chú thích và hình ảnh được duyệt trước khi xuất bản.' },
    ], checklist: ['Ghi rõ ngày và bối cảnh của ảnh.', 'Chú thích theo quan sát, không suy diễn về hàng hóa.', 'Bổ sung dữ liệu kiểm kê riêng nếu cần nêu số lượng/chủng loại.'],
  },
];

async function main() {
  const results = [];
  for (const draft of drafts) {
    const previous = await db.post.findUnique({ where: { slug: draft.slug }, select: { id: true, seo: true } });
    if (!previous) throw new Error(`Không tìm thấy Draft: ${draft.slug}`);
    const oldSeo = previous.seo && typeof previous.seo === 'object' ? previous.seo as Record<string, unknown> : {};
    const tableOfContents = draft.sections.map(({ title }) => ({ title, anchor: slugify(title) }));
    await db.post.update({ where: { id: previous.id }, data: {
      title: draft.title, excerpt: draft.excerpt, content: contentFor(draft), tags: draft.tags,
      tableOfContents,
      seo: { ...oldSeo, title: draft.title, description: draft.description, primaryKeyword: draft.keyword, secondaryKeywords: draft.tags.filter((tag) => tag !== draft.keyword), keywords: draft.tags },
      status: ContentStatus.DRAFT,
    } });
    results.push(draft.slug);
  }
  console.log(JSON.stringify({ updated: results.length, slugs: results }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
