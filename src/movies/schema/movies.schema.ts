import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop([{ id: Number, name: String }])
  genres: { id: number; name: string }[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
