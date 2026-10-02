import assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { RolesGuard } from '../src/auth/roles.guard';

async function main() {
  const hash = await bcrypt.hash('secret123', 4);
  const created: any[] = [];
  const prisma: any = { user: {
    findUnique: async ({ where }: any) => where.email === 'existing@example.com' ? { id:'u0', email:where.email, password:hash, role:'STOREKEEPER' } : null,
    create: async ({ data }: any) => { created.push(data); return { id:'u1', ...data }; },
  }};
  const jwt: any = { sign: (payload:any, opts:any) => JSON.stringify({payload,opts}), verify: (token:string) => { if(token==='bad') throw new Error('bad'); return {sub:'u1'}; } };
  const auth = new AuthService(prisma, jwt);

  await assert.rejects(() => auth.register({ email:'existing@example.com', password:'x', role:'ADMIN_MANAGER' } as any), BadRequestException);
  const registered = await auth.register({ email:'new@example.com', password:'secret123', role:'ADMIN_MANAGER' } as any);
  assert.equal(registered.role, 'STOREKEEPER', 'public registration must not grant admin');
  assert.equal(created[0].role, 'STOREKEEPER');

  await assert.rejects(() => auth.login('missing@example.com','x'), UnauthorizedException);
  const login = await auth.login('existing@example.com','secret123');
  assert.equal(login.user.role, 'STOREKEEPER');
  assert.ok(login.accessToken && login.refreshToken);
  assert.throws(() => auth.verifyRefreshToken('bad'), UnauthorizedException);

  const reflector:any = { getAllAndOverride: () => ['ADMIN_MANAGER'] };
  const guard = new RolesGuard(reflector);
  const ctx=(user:any):any=>({getHandler:()=>null,getClass:()=>null,switchToHttp:()=>({getRequest:()=>({user})})});
  assert.equal(guard.canActivate(ctx({role:'ADMIN_MANAGER'})), true);
  assert.throws(() => guard.canActivate(ctx({role:'STOREKEEPER'})), ForbiddenException);
  assert.throws(() => guard.canActivate(ctx(undefined)), ForbiddenException);
  reflector.getAllAndOverride=()=>undefined;
  assert.equal(guard.canActivate(ctx(undefined)), true);
  console.log('auth critical regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
