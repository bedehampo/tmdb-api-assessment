import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Rating extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: false, default: null })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'Movie', required: true })
  movieId: Types.ObjectId;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
