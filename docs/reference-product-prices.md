# Giá tham khảo để thử catalog (2026)

Nguồn bảng **lốp đặc theo thương hiệu và kích thước**: https://xenanghiepphat.com/lop-xe-nang (phần bảng giá 2026). Đây là giá niêm yết bên thứ ba, **không phải báo giá chính thức của Võ Mâm Xe Nâng**.

## Phạm vi

- Chỉ cập nhật `Product.sellingPrice IS NULL`, trạng thái `PUBLISHED`, lốp **SOLID/NEW** có đúng brand và size trong bảng giá công khai.
- Không tự đặt giá cho mâm, vỏ cũ, không vết, vỏ hơi và kích thước/brand không khớp; giữ `Liên hệ báo giá`.
- Không sửa giá nhập, tồn kho, giá đã được nhập, hoặc giá B2B.
- Tự thêm tag `PRICE_REFERENCE_2026`. Trang listing/detail ghi rõ **Giá tham khảo**; Stripe checkout từ sản phẩm được gắn tag bị chặn.
- Khi admin thay `sellingPrice` thành giá chính thức khác với giá tham khảo, tag được gỡ. Sau đó checkout mới tiếp tục được.

## Triển khai staging / production

Workflow GitHub Actions: **Reference product pricing (operator approved)**. Khởi đầu bằng `apply=false` và đúng tên cơ sở dữ liệu, xem bảng `changes` trong log trước khi quyết định ghi dữ liệu. Workflow staging sử dụng GitHub Environment `Staging` và secret `STAGING_DATABASE_URL`. Workflow production dry-run sử dụng Environment `Production` và secret `DIRECT_DATABASE_URL`.

**Lưu ý quan trọng:** Production `apply=true` trong workflow cố ý bị chặn, cho tới khi nhà vận hành xác minh một durable backup/restore riêng biệt (không phải file backup ephemeral từ CI). Đây là thay đổi giá hiển thị cho khách hàng nên phải được kiểm soát.

Khi đã có durable backup và đã xác nhận thông tin database đích, nhà vận hành có thể chạy công cụ bằng môi trường bảo mật (không in connection string):

```sh
cd backend
# Giữ connection URL trong secrets manager, tuyệt đối không commit.
REFERENCE_PRICE_ENV=production \
REFERENCE_PRICE_DATABASE_URL="$DIRECT_DATABASE_URL" \
REFERENCE_PRICE_EXPECT_DB="<database-name>" \
yarn ts-node --transpile-only scripts/apply-reference-product-prices.ts

# Chỉ sau khi xem kết quả dry run + có durable backup:
REFERENCE_PRICE_ENV=production \
REFERENCE_PRICE_DATABASE_URL="$DIRECT_DATABASE_URL" \
REFERENCE_PRICE_EXPECT_DB="<database-name>" \
CONFIRM_REFERENCE_PRICE_APPLY=YES \
CONFIRM_PRODUCTION_REFERENCE_PRICES=YES \
yarn ts-node --transpile-only scripts/apply-reference-product-prices.ts --apply
```

Staging tương tự nhưng `REFERENCE_PRICE_ENV=staging`, secret `STAGING_DATABASE_URL` và không cần `CONFIRM_PRODUCTION_REFERENCE_PRICES`.

Sau khi áp dụng, kiểm tra `/products` (lọc giá, sort) và detail; xác nhận những SKU khác vẫn giá cũ hoặc `Liên hệ`, checkout chặn các giá tham khảo, các giá chính thức vẫn checkout được. Không chạy Stripe live với dữ liệu tham khảo.

## Lưu ý

Chạy lại script là idempotent: những sản phẩm đã có giá không bị ghi đè. Khi chủ cửa hàng sửa giá thật, việc không khớp với giá mẫu sẽ kích hoạt gỡ tag. Nếu muốn chủ động duyệt mức giá tham khảo thành giá bán y hệt, cần thao tác duyệt giá riêng qua quy trình quản trị thay vì giả lập một thay đổi.
