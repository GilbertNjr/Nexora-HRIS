import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth (Otentikasi & Sesi)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login Pengguna',
    description:
      'Otentikasi email & kata sandi dengan proteksi brute force (lockout 15m setelah 5x gagal) dan Single Active Session untuk akun Karyawan.',
  })
  @ApiResponse({ status: 200, description: 'Login berhasil, token dikembalikan' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid atau akun terkunci' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perpanjang Sesi (Refresh Token Rotation)',
    description:
      'Menukarkan refresh token aktif dengan access token baru dan refresh token baru.',
  })
  @ApiResponse({ status: 200, description: 'Token berhasil dirotasi' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid atau kedaluwarsa' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.authService.refreshTokens(dto, userAgent, ipAddress);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrasi Akun Baru (Initial Provisioning)',
    description: 'Membuat akun pengguna baru dengan role tertentu.',
  })
  @ApiResponse({ status: 201, description: 'Pengguna berhasil didaftarkan' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout Pengguna',
    description: 'Mencabut sesi token aktif dan mengakhiri login.',
  })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diakhiri' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.authService.logout(userId, body?.refreshToken, ipAddress);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Profil Pengguna Aktif',
    description:
      'Mendapatkan data identitas, peran (roles), izin (permissions), dan snapshot data karyawan dari pengguna yang sedang login.',
  })
  @ApiResponse({ status: 200, description: 'Data profil berhasil diambil' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
