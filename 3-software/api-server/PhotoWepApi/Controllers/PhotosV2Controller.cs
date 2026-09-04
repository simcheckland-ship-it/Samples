using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
using PhotoWepApi.Helpers;
using PhotoWepApi.Models;
using SharpCompress.Common;
using SkiaSharp;
using System.Globalization;
using System.Text.Json;


namespace PhotoWepApi.Controllers
{
    [ApiController]     // Tells .NET this class handles API requests
    [Route("api/v2/photos")] // Sets the base web path to: api/photos
    public class PhotosV2Controller : Controller
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _environment;

        private string? _connectionString => _config["MongoDB:connection"];


        private IMongoClient? getClient()
        {
            var key = _config["MongoDB:ApiKey"];

            string? connectionString = _connectionString;
            if (string.IsNullOrEmpty(connectionString)) return null;

            connectionString = connectionString.Replace("<password>", key);

            var client = new MongoClient(connectionString);

            return client;
        }

        private IMongoDatabase? getDatabase()
        {
            var client = getClient();
            if (client == null) return null;

            // 2. Get your database and collection
            IMongoDatabase database = client.GetDatabase("PhotoData"); //your_database_name

            return database;

        }

        public PhotosV2Controller(IConfiguration config, IWebHostEnvironment environment)
        {
            _config = config;
            _environment = environment;
        }

        [Route("dev/ping")]
        [HttpGet]
        public IActionResult Ping()
        {
            var key = _config["MongoDB:ApiKey"];

            string? connectionString = _connectionString;
            if (string.IsNullOrEmpty(connectionString)) return Ok("Bad connection string"); ;

            connectionString = connectionString.Replace("<password>", key);

            var settings = MongoClientSettings.FromConnectionString(connectionString);
            // Set the ServerApi field of the settings object to set the version of the Stable API on the client
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            // Create a new client and connect to the server
            var client = new MongoClient(settings);
            // Send a ping to confirm a successful connection
            try
            {
                var result = client.GetDatabase("admin").RunCommand<BsonDocument>(new BsonDocument("ping", 1));
                var retVal = "Pinged your deployment. You successfully connected to MongoDB!";
                Console.WriteLine(retVal);
                return Ok(retVal);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return Ok(ex.Message);
            }


        }

        [HttpGet("dev/check-config")]
        public IActionResult CheckConfig()
        {
            var key = _config["MongoDB:ApiKey"];

            if (string.IsNullOrEmpty(key))
                return NotFound("Key is completely missing!");

            // NEVER return the full secret in an API response. 
            // Mask it to confirm it exists and starts with the correct characters.
            var maskedKey = $"{key.Substring(0, 3)}...{key.Substring(key.Length - 3)}";
            var retVal = new { status = "Loaded", preview = maskedKey, length = key.Length };

            Console.WriteLine(retVal);

            return Ok(retVal);
        }

        [Route("dev/FolderTest/{testID}")]
        [HttpGet]
        public IActionResult FolderTest(int testID)
        {
            string uploadFolder = Path.Combine(_environment.ContentRootPath, "uploads");
            if (testID == 1)
            {
                uploadFolder = "/var/www/photo-app/uploads";
            }
            string v = $"FolderExists {uploadFolder} {System.IO.Directory.Exists(uploadFolder)}";
            Console.WriteLine(v);
            return Ok(v);
        }

        [Route("")]
        [Route("GetPhotos")]
        [HttpGet]
        public async Task<IActionResult> GetPhotos()
        {
            Console.WriteLine("GetPhotos()");

            var db = getDatabase();
            if (db == null) return BadRequest("Database error");
            var collection = db.GetCollection<PhotoItem>("PhotoGlobe"); //your_collection_name

            var filter = Builders<PhotoItem>.Filter.Empty;
            var results = await collection.Find(filter).ToListAsync();

            return Ok(results);
        }

        [Route("GetPhotosByType/{type}")]
        [HttpGet]
        public async Task<IActionResult> GetPhotosByType(string type)
        {
            Console.WriteLine($"GetPhotos(\"{type}\")");

            var db = getDatabase();
            if (db == null) return BadRequest("Database error");
            var collection = db.GetCollection<PhotoItem>("PhotoGlobe"); //your_collection_name

            var filter = Builders<PhotoItem>.Filter.Eq(x => x.Type, type);
            var results = await collection.Find(filter).ToListAsync();

            return Ok(results);
        }



        [HttpPost("Upload")]
        [RequestSizeLimit(52_428_800)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image, [FromForm] string type)
        {
            Console.WriteLine($"UploadImage([FromForm])");

            if (image == null || image.Length == 0)
                return BadRequest("No image file uploaded.");

            string uniqueFileName = string.Empty;
            string fullPath = string.Empty;
            string sourcePath = string.Empty;

            // Save File
            try
            {
                // 1. Define the save path for a Linux server
                // Use Path.Combine to handle path separators across different operating systems safely
                //string uploadFolder = Path.Combine(_environment.ContentRootPath, "uploads");
                string uploadFolder = "/var/www/photo-app/uploads";
                //#if DEBUG
                //                uploadFolder = Path.Combine(_environment.ContentRootPath, "uploads");
                //#endif

                // 2. Ensure the directory exists (Linux creates it with standard permissions)
                if (!System.IO.Directory.Exists(uploadFolder))
                {
                    System.IO.Directory.CreateDirectory(uploadFolder);
                }

                // 3. Generate a secure, unique filename to avoid naming collisions
                uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}".ToLower();
                fullPath = Path.Combine(uploadFolder, uniqueFileName);
                sourcePath = fullPath;
                //var type = image.

                // Save the original file instantly using the built-in .NET shortcut
                using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
                {
                    await image.CopyToAsync(fileStream);
                }

                // 1. Open stream from IFormFile
                using var uploadStream = image.OpenReadStream();

                // 2. Process orientation
                using var originalBitmap = ImageResizer.LoadAndFixOrientation(uploadStream);
                if (originalBitmap == null) return BadRequest("Invalid image format.");


                // 3. Create and save preview image (800x600 boundaries)
                fullPath = Path.Combine(uploadFolder, "small", uniqueFileName);
                ImageResizer.SaveResizedSkiaImage(originalBitmap, fullPath, 800, 800);

                // 4. Create and save thumbnail image (150x150 boundaries)
                fullPath = Path.Combine(uploadFolder, "thumbs", uniqueFileName);
                ImageResizer.SaveResizedSkiaImage(originalBitmap, fullPath, 160, 160);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

            try
            {
                // 1. Open the file stream directly from the HTTP request
                using var stream = image.OpenReadStream();

                // 2. Read all metadata directories from the stream
                var directories = ImageMetadataReader.ReadMetadata(stream);

                // Initialize a response object
                var photoItem = new PhotoItem();

                photoItem.FileName = uniqueFileName;
                photoItem.SourceFile = sourcePath;
                photoItem.Type = type;

                //  Extract SubIFD directory (Contains Date, Exposure, Camera info)
                var subIfdDirectory = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
                if (subIfdDirectory != null)
                {
                    string? dateString = subIfdDirectory.GetDescription(ExifDirectoryBase.TagDateTimeOriginal);

                    if (!string.IsNullOrEmpty(dateString))
                    {
                        // 1. Parse strictly with its zone offset intact
                        string format = "yyyy:MM:dd HH:mm:ss";

                        // AssumeUniversal treats it as UTC; AdjustToUniversal ensures the Kind property is Utc
                        DateTime utcDate = DateTime.ParseExact(dateString, format, CultureInfo.InvariantCulture,
                                                               DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
                        photoItem.DateTimeOriginal = utcDate.ToString("yyyy-MM-ddTHH:mm:ssZ");

                    }
                }


                //  Extract GPS directory (Contains coordinates)
                var gpsDirectory = directories.OfType<GpsDirectory>().FirstOrDefault();
                if (gpsDirectory != null)
                {
                    // 1. Manually pull the raw coordinates and references from EXIF tags
                    var latitudeRational = gpsDirectory.GetRationalArray(GpsDirectory.TagLatitude);
                    var latitudeRef = gpsDirectory.GetString(GpsDirectory.TagLatitudeRef); // "N" or "S"

                    var longitudeRational = gpsDirectory.GetRationalArray(GpsDirectory.TagLongitude);
                    var longitudeRef = gpsDirectory.GetString(GpsDirectory.TagLongitudeRef); // "E" or "W"

                    if (latitudeRational != null && latitudeRef != null)
                    {
                        // Convert Degrees, Minutes, Seconds to decimal format
                        double lat = Converters.ConvertToDecimalDegrees(latitudeRational);
                        if (latitudeRef.Equals("S", StringComparison.OrdinalIgnoreCase)) lat = -lat;
                        photoItem.GPSLatitude = lat;
                    }

                    if (longitudeRational != null && longitudeRef != null)
                    {
                        // Convert Degrees, Minutes, Seconds to decimal format
                        double lng = Converters.ConvertToDecimalDegrees(longitudeRational);
                        if (longitudeRef.Equals("W", StringComparison.OrdinalIgnoreCase)) lng = -lng;
                        photoItem.GPSLongitude = lng;
                    }

                    if (gpsDirectory.TryGetDouble(GpsDirectory.TagImgDirection, out double degrees))
                    {
                        photoItem.GPSImgDirection = degrees; // e.g. 180.5
                    }

                    // Extract North Reference ("T" for True North, "M" for Magnetic)
                    var d = gpsDirectory.GetDescription(GpsDirectory.TagImgDirectionRef);
                    if (d != null)
                    {
                        photoItem.CompassReference = d;
                    }

                }

                // Add to data
                var db = getDatabase();
                if (db == null) return BadRequest("Database error");
                var collection = db.GetCollection<PhotoItem>("PhotoGlobe"); //your_collection_name

                await collection.InsertOneAsync(photoItem);

                return Ok(photoItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
