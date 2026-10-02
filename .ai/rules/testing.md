# Testing Rules
Frontend baseline: relevant Node tests, lint, TypeScript no-emit, production build.
Backend baseline: TypeScript no-emit, relevant Jest/domain tests, production-seed tests when seed logic changes, production build.
Schema changes require migration-specific validation and affected service tests.
Critical auth/inventory/orders/payment/pricing flows need success and failure behavioral tests.
Never weaken a test just to make CI green; document unrelated pre-existing failures separately.
