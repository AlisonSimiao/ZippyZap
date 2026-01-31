import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Req() req: Request & { user: { id: number } }) {
    return this.dashboardService.getOverview(req.user.id);
  }

  @Post('send-message')
  async sendMessage(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { to: string; message: string },
  ) {
    return this.dashboardService.sendMessage(
      req.user.id,
      body.to,
      body.message,
    );
  }

  /**
   * Admin: Reset usage counters for a user
   * DELETE /dashboard/admin/usage/:userId
   */
  @Post('admin/reset-usage/:userId')
  @UseGuards(AdminGuard)
  async adminResetUsage(
    @Param('userId') userId: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.dashboardService.adminResetUsage(
      parseInt(userId, 10),
      req.user.id,
    );
  }

  /**
   * Admin: Get detailed usage for a user
   * GET /dashboard/admin/usage/:userId?date=2026-01-31
   */
  @Get('admin/usage/:userId')
  @UseGuards(AdminGuard)
  async adminGetUsageDetail(
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return this.dashboardService.adminGetUsageDetail(
      parseInt(userId, 10),
      date,
    );
  }

  /**
   * Admin: Manually set usage limit (emergency only)
   * POST /dashboard/admin/set-usage-limit/:userId
   */
  @Post('admin/set-usage-limit/:userId')
  @UseGuards(AdminGuard)
  async adminSetUsageLimit(
    @Param('userId') userId: string,
    @Body() body: { dateKey: string; newLimit: number },
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.dashboardService.adminSetUsageLimit(
      parseInt(userId, 10),
      body.dateKey,
      body.newLimit,
      req.user.id,
    );
  }
}
