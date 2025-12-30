import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto, UpdateDriverDto } from './driver.dto';
import { DriverStatus } from './driver.schema';
import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('drivers')
@UseGuards(JwtAuthGuard)

export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
 
  @AuthWithRoles('admin')
  async createDriver(
    @Query('userId') userId: string,
    @Body() createDriverDto: CreateDriverDto,
  ) {
    return await this.driverService.createDriver(userId, createDriverDto);
  }

  @Get()
  @AuthWithRoles('admin')
  async getAllDrivers(@Query('isActive') isActive?: boolean) {
    return await this.driverService.getAllDrivers(isActive);
  }

  @Get(':driverId')
  @AuthWithRoles('admin', 'driver')
  async getDriverById(@Param('driverId') driverId: string) {
    return await this.driverService.getDriverById(driverId);
  }

  @Get('user/:userId')
  @AuthWithRoles('admin', 'driver')
  async getDriverByUserId(@Param('userId') userId: string) {
    return await this.driverService.getDriverByUserId(userId);
  }

  @Get('status/available')
  @AuthWithRoles('driver', 'admin')
  async getAvailableDrivers() {
    return await this.driverService.getAvailableDrivers();
  }

  @Get('status/:status')
  @AuthWithRoles('admin')
  async getDriversByStatus(@Param('status') status: DriverStatus) {
    return await this.driverService.getDriversByStatus(status);
  }

  @Get('nearby/location')
  @AuthWithRoles('driver')
  async getNearbyAvailableDrivers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 5,
  ) {
    return await this.driverService.getNearbyAvailableDrivers(latitude, longitude, radius);
  }

  @Get('stats/overview')
  @AuthWithRoles('admin')
  async getDriverStatistics() {
    return await this.driverService.getDriverStatistics();
  }

  @Put(':driverId')
  @AuthWithRoles('admin')
  async updateDriver(
    @Param('driverId') driverId: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return await this.driverService.updateDriver(driverId, updateDriverDto);
  }

  @Put(':driverId/status')
  @AuthWithRoles('admin')
  async updateDriverStatus(
    @Param('driverId') driverId: string,
    @Body() data: { status: DriverStatus },
  ) {
    return await this.driverService.updateDriverStatus(driverId, data.status);
  }

  @Put(':driverId/location')
  @AuthWithRoles('driver')
  async updateDriverLocation(
    @Param('driverId') driverId: string,
    @Body() locationData: { latitude: number; longitude: number; address: string },
  ) {
    return await this.driverService.updateDriverLocation(
      driverId,
      locationData.latitude,
      locationData.longitude,
      locationData.address,
    );
  }

  @Put(':driverId/verify')
  @AuthWithRoles('admin')
  async verifyDriver(@Param('driverId') driverId: string) {
    return await this.driverService.verifyDriver(driverId);
  }

  @Put(':driverId/earnings')
  @AuthWithRoles('admin')
  async addEarnings(
    @Param('driverId') driverId: string,
    @Body() data: { amount: number },
  ) {
    return await this.driverService.addEarnings(driverId, data.amount);
  }

  @Put(':driverId/rating')
  //@AuthWithRoles('custmor')
  async updateDriverRating(
    @Param('driverId') driverId: string,
    @Body() data: { rating: number },
  ) {
    return await this.driverService.updateDriverRating(driverId, data.rating);
  }

  @Put(':driverId/trips')
  @AuthWithRoles('driver')
  async incrementTotalTrips(@Param('driverId') driverId: string) {
    return await this.driverService.incrementTotalTrips(driverId);
  }

  @Put(':driverId/deactivate')
  @AuthWithRoles('admin')
  async deactivateDriver(@Param('driverId') driverId: string) {
    return await this.driverService.deactivateDriver(driverId);
  }

  @Put(':driverId/activate')
  @AuthWithRoles('admin')
  async activateDriver(@Param('driverId') driverId: string) {
    return await this.driverService.activateDriver(driverId);
  }

  @Delete(':driverId')
  @AuthWithRoles('admin')
  async deleteDriver(@Param('driverId') driverId: string) {
    return await this.driverService.deleteDriver(driverId);
  }
}
