using SkiaSharp;

namespace PhotoWepApi.Helpers
{
    public class ImageResizer
    {

        public static void SaveResizedSkiaImage(SKBitmap source, string outputPath, int maxWidth, int maxHeight)
        {
            // Calculate proportional dimensions (ResizeMode.Max emulation)
            double ratioX = (double)maxWidth / source.Width;
            double ratioY = (double)maxHeight / source.Height;
            double ratio = Math.Min(ratioX, ratioY);

            // Do not upscale smaller images
            if (ratio >= 1.0)
            {
                using var image = SKImage.FromBitmap(source);
                using var data = image.Encode(SKEncodedImageFormat.Jpeg, 85);
                using var stream = System.IO.File.OpenWrite(outputPath);
                data.SaveTo(stream);
                return;
            }

            int newWidth = (int)(source.Width * ratio);
            int newHeight = (int)(source.Height * ratio);

            var samplingOptions = new SKSamplingOptions(SKCubicResampler.Mitchell);
            // Perform high-quality scaling
            using var resizedBitmap = new SKBitmap(newWidth, newHeight);
            source.ScalePixels(resizedBitmap, samplingOptions);

            // Save to disk
            using var resizedImage = SKImage.FromBitmap(resizedBitmap);
            using var encodedData = resizedImage.Encode(SKEncodedImageFormat.Jpeg, 85); // 85% Quality
            using var outputStream = System.IO.File.OpenWrite(outputPath);
            encodedData.SaveTo(outputStream);
        }



        public static SKBitmap LoadAndFixOrientation(Stream fileStream)
        {
            // 1. Ensure the stream is readable and seekable
            // If it's a network/request stream, copy it to a MemoryStream to allow seeking
            Stream seekableStream = fileStream;
            if (!fileStream.CanSeek)
            {
                seekableStream = new MemoryStream();
                fileStream.CopyTo(seekableStream);
            }

            seekableStream.Position = 0;

            // 2. Read metadata using SKCodec
            using var codec = SKCodec.Create(seekableStream, out SKCodecResult result);
            if (codec == null) return null;

            // Get the embedded EXIF orientation metadata
            SKEncodedOrigin origin = codec.EncodedOrigin;

            // 3. Decode the raw bitmap
            seekableStream.Position = 0; // Reset stream position
            var originalBitmap = SKBitmap.Decode(seekableStream);

            // If orientation is standard, return the bitmap as-is
            if (origin == SKEncodedOrigin.TopLeft || origin == SKEncodedOrigin.Default)
            {
                // If we created a temporary memory stream, dispose it safely
                if (seekableStream != fileStream) seekableStream.Dispose();
                return originalBitmap;
            }

            // 4. Calculate target dimensions based on rotation requirements
            bool isSwapped = origin == SKEncodedOrigin.LeftTop ||
                             origin == SKEncodedOrigin.RightTop ||
                             origin == SKEncodedOrigin.RightBottom ||
                             origin == SKEncodedOrigin.LeftBottom;

            int targetWidth = isSwapped ? originalBitmap.Height : originalBitmap.Width;
            int targetHeight = isSwapped ? originalBitmap.Width : originalBitmap.Height;

            // 5. Create the corrected bitmap
            var correctedBitmap = new SKBitmap(targetWidth, targetHeight);

            using (var canvas = new SKCanvas(correctedBitmap))
            {
                canvas.Clear(SKColors.Transparent);
                var matrix = SKMatrix.CreateIdentity();

                switch (origin)
                {
                    case SKEncodedOrigin.TopRight: // Flip Horizontal
                        matrix = matrix.PostConcat(SKMatrix.CreateScale(-1, 1, originalBitmap.Width / 2f, originalBitmap.Height / 2f));
                        break;
                    case SKEncodedOrigin.BottomRight: // Rotate 180
                        matrix = matrix.PostConcat(SKMatrix.CreateRotationDegrees(180, originalBitmap.Width / 2f, originalBitmap.Height / 2f));
                        break;
                    case SKEncodedOrigin.BottomLeft: // Flip Vertical
                        matrix = matrix.PostConcat(SKMatrix.CreateScale(1, -1, originalBitmap.Width / 2f, originalBitmap.Height / 2f));
                        break;
                    case SKEncodedOrigin.LeftTop: // Rotate 90 CW & Flip Vertical
                        matrix = matrix.PostConcat(SKMatrix.CreateRotationDegrees(90));
                        matrix = matrix.PostConcat(SKMatrix.CreateScale(1, -1));
                        break;
                    case SKEncodedOrigin.RightTop: // Rotate 90 CW
                        canvas.Translate(targetWidth, 0);
                        canvas.RotateDegrees(90);
                        break;
                    case SKEncodedOrigin.RightBottom: // Rotate 90 CW & Flip Horizontal
                        matrix = matrix.PostConcat(SKMatrix.CreateRotationDegrees(90));
                        matrix = matrix.PostConcat(SKMatrix.CreateScale(-1, 1));
                        break;
                    case SKEncodedOrigin.LeftBottom: // Rotate 270 CW
                        canvas.Translate(0, targetHeight);
                        canvas.RotateDegrees(-90);
                        break;
                }

                if (isSwapped && (origin == SKEncodedOrigin.RightTop || origin == SKEncodedOrigin.LeftBottom))
                {
                    canvas.DrawBitmap(originalBitmap, 0, 0, SKSamplingOptions.Default, null);
                }
                else
                {
                    canvas.SetMatrix(matrix);
                    canvas.DrawBitmap(originalBitmap, 0, 0, SKSamplingOptions.Default, null);
                }
            }

            originalBitmap.Dispose();
            if (seekableStream != fileStream) seekableStream.Dispose();

            return correctedBitmap;
        }


    }
}
