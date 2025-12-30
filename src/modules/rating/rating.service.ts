import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './rating.schema';
import { CreateRatingDto, UpdateRatingDto } from './rating.dto';

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<RatingDocument>) {}

  /** إنشاء تقييم جديد */
  async createRating(userId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
    const newRating = new this.ratingModel({
      ...createRatingDto,
      userId: new Types.ObjectId(userId),
      orderId: new Types.ObjectId(createRatingDto.orderId),
      serviceId: new Types.ObjectId(createRatingDto.serviceId),
      driverId: createRatingDto.driverId
        ? new Types.ObjectId(createRatingDto.driverId)
        : undefined,
    });

    return await newRating.save();
  }

  /** جلب تقييم حسب معرفه */
  async getRatingById(ratingId: string): Promise<Rating> {
    const rating = await this.ratingModel
      .findById(ratingId)
      .populate('userId')
      .populate('driverId')
      .populate('serviceId');

    if (!rating) {
      throw new NotFoundException('التقييم غير موجود');
    }
    return rating;
  }

  /** جلب تقييم مرتبط بطلب معين */
  async getRatingsByOrderId(orderId: string): Promise<Rating> {
    const rating = await this.ratingModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .populate('userId')
      .populate('serviceId');
  
    if (!rating) {
      throw new NotFoundException('التقييم غير موجود');
    }
  
    return rating;
  }

  /** جلب جميع التقييمات لخدمة معينة */
  async getRatingsByServiceId(serviceId: string): Promise<Rating[]> {
    return await this.ratingModel
      .find({ serviceId: new Types.ObjectId(serviceId) })
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  /** جلب جميع التقييمات لسائق معين */
  async getRatingsByDriverId(driverId: string): Promise<Rating[]> {
    return await this.ratingModel
      .find({ driverId: new Types.ObjectId(driverId) })
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  /** جلب جميع التقييمات لمستخدم معين */
  async getRatingsByUserId(userId: string): Promise<Rating[]> {
    return await this.ratingModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  /** تحديث تقييم موجود */
  async updateRating(ratingId: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingModel.findByIdAndUpdate(
      ratingId,
      { $set: updateRatingDto },
      { new: true }
    );

    if (!rating) {
      throw new NotFoundException('التقييم غير موجود');
    }
    return rating;
  }

  /** حساب متوسط تقييم خدمة معينة */
  async getAverageRatingForService(serviceId: string): Promise<number> {
    const result = await this.ratingModel.aggregate([
      { $match: { serviceId: new Types.ObjectId(serviceId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    return result[0]?.avgRating || 0;
  }

  /** حساب متوسط تقييم سائق معين */
  async getAverageRatingForDriver(driverId: string): Promise<number> {
    const result = await this.ratingModel.aggregate([
      { $match: { driverId: new Types.ObjectId(driverId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    return result[0]?.avgRating || 0;
  }

  /** توزيع التقييمات لخدمة معينة (عدد كل تقييم) */
  async getRatingDistribution(serviceId: string) {
    return await this.ratingModel.aggregate([
      { $match: { serviceId: new Types.ObjectId(serviceId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  /** حذف تقييم */
  async deleteRating(ratingId: string): Promise<{ message: string }> {
    const result = await this.ratingModel.findByIdAndDelete(ratingId);
    if (!result) {
      throw new NotFoundException('التقييم غير موجود');
    }
    return { message: 'تم حذف التقييم بنجاح' };
  }

  /** جلب التقييمات مع فلترة اختيارية حسب الخدمة، السائق، وأيضاً حسب الحد الأدنى والحد الأعلى للتقييم */
  async getRatingsWithFilters(filters: {
    serviceId?: string;
    driverId?: string;
    minRating?: number;
    maxRating?: number;
  }) {
    const query: any = {};

    if (filters.serviceId) query.serviceId = new Types.ObjectId(filters.serviceId);
    if (filters.driverId) query.driverId = new Types.ObjectId(filters.driverId);

    if (filters.minRating || filters.maxRating) {
      query.rating = {};
      if (filters.minRating) query.rating.$gte = filters.minRating;
      if (filters.maxRating) query.rating.$lte = filters.maxRating;
    }

    return await this.ratingModel.find(query).sort({ createdAt: -1 }).populate('userId');
  }
}
