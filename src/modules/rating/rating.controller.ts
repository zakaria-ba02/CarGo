import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto, UpdateRatingDto } from './rating.dto';
import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ratings')
@UseGuards(JwtAuthGuard)

export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @AuthWithRoles('customer')
  async createRating(
    @Query('userId') userId: string,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return await this.ratingService.createRating(userId, createRatingDto);
  }

  @Get(':ratingId')
  @AuthWithRoles('customer', 'driver', 'admin')
  async getRatingById(@Param('ratingId') ratingId: string) {
    return await this.ratingService.getRatingById(ratingId);
  }

  @Get('order/:orderId')
  @AuthWithRoles('customer', 'driver', 'admin')
  async getRatingsByOrderId(@Param('orderId') orderId: string) {
    return await this.ratingService.getRatingsByOrderId(orderId);
  }

  @Get('service/:serviceId')
  @AuthWithRoles('customer', 'admin')
  async getRatingsByServiceId(@Param('serviceId') serviceId: string) {
    return await this.ratingService.getRatingsByServiceId(serviceId);
  }

  @Get('service/:serviceId/average')
  @AuthWithRoles('customer', 'admin')
  async getAverageRatingForService(@Param('serviceId') serviceId: string) {
    const avgRating = await this.ratingService.getAverageRatingForService(serviceId);
    return { serviceId, averageRating: avgRating };
  }

  @Get('driver/:driverId')
  @AuthWithRoles('driver', 'admin')
  async getRatingsByDriverId(@Param('driverId') driverId: string) {
    return await this.ratingService.getRatingsByDriverId(driverId);
  }

  @Get('driver/:driverId/average')
  @AuthWithRoles('driver', 'admin')
  async getAverageRatingForDriver(@Param('driverId') driverId: string) {
    const avgRating = await this.ratingService.getAverageRatingForDriver(driverId);
    return { driverId, averageRating: avgRating };
  }

  @Get('user/:userId')
  @AuthWithRoles('customer', 'admin')
  async getRatingsByUserId(@Param('userId') userId: string) {
    return await this.ratingService.getRatingsByUserId(userId);
  }

  @Get('service/:serviceId/distribution')
  @AuthWithRoles('admin')
  async getRatingDistribution(@Param('serviceId') serviceId: string) {
    return await this.ratingService.getRatingDistribution(serviceId);
  }

  @Get('filter/search')
  @AuthWithRoles('admin')
  async getRatingsWithFilters(
    @Query('serviceId') serviceId?: string,
    @Query('driverId') driverId?: string,
    @Query('minRating') minRating?: number,
    @Query('maxRating') maxRating?: number,
  ) {
    return await this.ratingService.getRatingsWithFilters({
      serviceId,
      driverId,
      minRating: minRating ? parseInt(minRating.toString()) : undefined,
      maxRating: maxRating ? parseInt(maxRating.toString()) : undefined,
    });
  }

  @Put(':ratingId')
  @AuthWithRoles('customer', 'admin')
  async updateRating(
    @Param('ratingId') ratingId: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return await this.ratingService.updateRating(ratingId, updateRatingDto);
  }

  @Delete(':ratingId')
  @AuthWithRoles('admin')
  async deleteRating(@Param('ratingId') ratingId: string) {
    return await this.ratingService.deleteRating(ratingId);
  }
}

