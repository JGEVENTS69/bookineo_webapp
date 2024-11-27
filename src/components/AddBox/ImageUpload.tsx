import { Upload } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUpload = ({ imagePreview, onImageChange }: ImageUploadProps) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Photo (obligatoire)</label>
      <div className="relative">
        <input
          type="file"
          className="hidden"
          id="upload"
          onChange={onImageChange}
          required
          accept="image/*"
        />
        <label
          htmlFor="upload"
          className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all ${
            !imagePreview ? 'hover:border-primary' : ''
          }`}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Cliquez pour ajouter une photo</p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};