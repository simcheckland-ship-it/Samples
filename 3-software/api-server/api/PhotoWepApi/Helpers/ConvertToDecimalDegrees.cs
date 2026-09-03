using MetadataExtractor;

namespace PhotoWepApi.Helpers
{
    public class Converters
    {
        public static double ConvertToDecimalDegrees(Rational[] components)
        {
            if (components == null || components.Length < 3) return 0;

            // EXIF coordinates contain 3 parts: [0]=Degrees, [1]=Minutes, [2]=Seconds
            double degrees = components[0].ToDouble();
            double minutes = components[1].ToDouble();
            double seconds = components[2].ToDouble();

            return degrees + (minutes / 60.0) + (seconds / 3600.0);
        }
    }
}
