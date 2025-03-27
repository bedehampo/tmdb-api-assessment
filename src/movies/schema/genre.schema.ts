import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Genre extends Document {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
