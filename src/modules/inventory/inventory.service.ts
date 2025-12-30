import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument, ItemType } from './inventory.schema';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
  ) {}

  /**
   * إنشاء صنف جديد في المخزون
   * - يضيف تاريخ آخر إعادة تخزين كوقت حالي
   */
  async createInventoryItem(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const newItem = new this.inventoryModel({
      ...createInventoryDto,
      lastRestockDate: new Date(),
    });

    return await newItem.save();
  }

  /**
   * جلب كل الأصناف
   * - يمكن فلترة حسب isActive
   */
  async getAllInventoryItems(isActive?: boolean): Promise<Inventory[]> {
    const query = isActive !== undefined ? { isActive } : {};
    return await this.inventoryModel.find(query);
  }

  /**
   * جلب صنف معين حسب itemId
   * - يرمي خطأ إذا لم يتم العثور على الصنف
   */
  async getInventoryItemById(itemId: string): Promise<Inventory> {
    const item = await this.inventoryModel.findById(itemId);
    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return item;
  }

  /**
   * جلب جميع الأصناف حسب نوع الصنف (ItemType)
   * - فقط الأصناف النشطة
   */
  async getInventoryByItemType(itemType: ItemType): Promise<Inventory[]> {
    return await this.inventoryModel.find({ itemType, isActive: true });
  }

  /**
   * تحديث بيانات صنف معين
   * - يستخدم updateInventoryDto
   */
  async updateInventoryItem(itemId: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.inventoryModel.findByIdAndUpdate(
      itemId,
      { $set: updateInventoryDto },
      { new: true }
    );

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return item;
  }

  /**
   * تقليل كمية الصنف في المخزون
   * - يتحقق إذا الكمية المتاحة كافية
   * - يزيد totalUsed بمقدار الكمية المستخدمة
   */
  async decreaseQuantity(itemId: string, quantity: number): Promise<Inventory> {
    const item = await this.inventoryModel.findById(itemId);
    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
  
    if (item.quantity < quantity) {
      throw new BadRequestException('الكمية المتاحة أقل من الكمية المطلوبة');
    }
  
    const updatedItem = await this.inventoryModel.findByIdAndUpdate(
      itemId,
      { $inc: { quantity: -quantity, totalUsed: quantity } },
      { new: true },
    );
  
    if (!updatedItem) {
      throw new NotFoundException('حدث خطأ أثناء تحديث الصنف');
    }
  
    return updatedItem;
  }
  
  /**
   * زيادة كمية الصنف في المخزون
   * - يحدث تاريخ آخر إعادة تخزين
   */
  async increaseQuantity(itemId: string, quantity: number): Promise<Inventory> {
    const item = await this.inventoryModel.findByIdAndUpdate(
      itemId,
      {
        $inc: { quantity },
        $set: { lastRestockDate: new Date() },
      },
      { new: true }
    );

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return item;
  }

  /**
   * جلب الأصناف التي كميتها منخفضة (أقل أو تساوي الحد الأدنى)
   */
  async getLowStockItems(): Promise<Inventory[]> {
    return await this.inventoryModel.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true,
    });
  }

  /**
   * الحصول على ملخص المخزون
   * - عدد الأصناف الكلي
   * - عدد الأصناف منخفضة المخزون
   * - القيمة الإجمالية للمخزون
   */
  async getInventorySummary() {
    const total = await this.inventoryModel.countDocuments({ isActive: true });
    const lowStock = await this.inventoryModel.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true,
    });

    const totalValue = await this.inventoryModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } },
    ]);

    return {
      totalItems: total,
      lowStockItems: lowStock,
      totalValue: totalValue[0]?.total || 0,
    };
  }

  /**
   * الحصول على إحصاءات المخزون حسب النوع
   * - عدد الأصناف لكل نوع
   * - مجموع الكمية لكل نوع
   */
  async getInventoryByType() {
    return await this.inventoryModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$itemType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]);
  }

  /**
   * تعطيل صنف معين
   */
  async deactivateInventoryItem(itemId: string): Promise<Inventory> {
    const item = await this.inventoryModel.findByIdAndUpdate(
      itemId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return item;
  }

  /**
   * إعادة تفعيل صنف معين
   */
  async activateInventoryItem(itemId: string): Promise<Inventory> {
    const item = await this.inventoryModel.findByIdAndUpdate(
      itemId,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return item;
  }

  /**
   * حذف صنف نهائيًا من قاعدة البيانات
   */
  async deleteInventoryItem(itemId: string): Promise<{ message: string }> {
    const result = await this.inventoryModel.findByIdAndDelete(itemId);
    if (!result) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return { message: 'تم حذف الصنف بنجاح' };
  }
}
