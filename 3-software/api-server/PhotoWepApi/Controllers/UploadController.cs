using Microsoft.AspNetCore.Mvc;

namespace PhotoWepApi.Controllers
{
    public class UploadController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
