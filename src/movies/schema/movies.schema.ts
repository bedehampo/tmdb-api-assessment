import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Movie extends Document {
  @Prop({ required: true, unique: true })
  movieId: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  overview: string;

  @Prop()
  release_date: Date;

  @Prop([Number])
  genres: number[];

  @Prop({ type: [Types.ObjectId], ref: 'Rating', required: true })
  ratings: Types.ObjectId[];

  @Prop({ default: 0 })
  avgRating: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
