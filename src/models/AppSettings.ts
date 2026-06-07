import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppSettings extends Document {
  key: string;
  value: any;
}

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const AppSettings: Model<IAppSettings> =
  mongoose.models.AppSettings || mongoose.model<IAppSettings>('AppSettings', AppSettingsSchema);
