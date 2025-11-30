import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    async getOverview(@Req() req: Request & { user: { id: number } }) {
        return this.dashboardService.getOverview(req.user.id);
    }

    @Post('send-message')
    async sendMessage(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { to: string; message: string }
    ) {
        return this.dashboardService.sendMessage(req.user.id, body.to, body.message);
    }
}
