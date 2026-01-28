import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';
import { ItemType } from './inventory.schema';
import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @AuthWithRoles('admin')
  async createInventoryItem(@Body() createInventoryDto: CreateInventoryDto) {
    return await this.inventoryService.createInventoryItem(createInventoryDto);
  }

  @Get()
  @AuthWithRoles('admin', 'customer', 'driver')
  async getAllInventoryItems(@Query('isActive') isActive?: boolean) {
    return await this.inventoryService.getAllInventoryItems(isActive);
  }

  @Get('type/:itemType')
  @AuthWithRoles('admin', 'customer', 'driver')
  async getInventoryByItemType(@Param('itemType') itemType: ItemType) {
    return await this.inventoryService.getInventoryByItemType(itemType);
  }

  @Get('low-stock')
  @AuthWithRoles('admin')
  async getLowStockItems() {
    return await this.inventoryService.getLowStockItems();
  }

  @Get('summary')
  @AuthWithRoles('admin')
  async getInventorySummary() {
    return await this.inventoryService.getInventorySummary();
  }

  @Get('stats/by-type')
  @AuthWithRoles('admin')
  async getInventoryByType() {
    return await this.inventoryService.getInventoryByType();
  }

  @Get(':itemId')
  @AuthWithRoles('admin', 'customer', 'driver')
  async getInventoryItemById(@Param('itemId') itemId: string) {
    return await this.inventoryService.getInventoryItemById(itemId);
  }

  @Put(':itemId')
  @AuthWithRoles('admin')
  async updateInventoryItem(
    @Param('itemId') itemId: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return await this.inventoryService.updateInventoryItem(itemId, updateInventoryDto);
  }

  @Put(':itemId/decrease')
  @AuthWithRoles('admin')
  async decreaseQuantity(
    @Param('itemId') itemId: string,
    @Body() data: { quantity: number },
  ) {
    return await this.inventoryService.decreaseQuantity(itemId, data.quantity);
  }

  @Put(':itemId/increase')
  @AuthWithRoles('admin')
  async increaseQuantity(
    @Param('itemId') itemId: string,
    @Body() data: { quantity: number },
  ) {
    return await this.inventoryService.increaseQuantity(itemId, data.quantity);
  }

  @Put(':itemId/deactivate')
  @AuthWithRoles('admin')
  async deactivateInventoryItem(@Param('itemId') itemId: string) {
    return await this.inventoryService.deactivateInventoryItem(itemId);
  }

  @Put(':itemId/activate')
  @AuthWithRoles('admin')
  async activateInventoryItem(@Param('itemId') itemId: string) {
    return await this.inventoryService.activateInventoryItem(itemId);
  }

  @Delete(':itemId')
  @AuthWithRoles('admin')
  async deleteInventoryItem(@Param('itemId') itemId: string) {
    return await this.inventoryService.deleteInventoryItem(itemId);
  }
}

