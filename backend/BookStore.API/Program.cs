using System.Text;
using System.Text.Json.Serialization;
using BookStore.API.Data;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Repositories.Implementations;
using BookStore.API.Services.Interfaces;
using BookStore.API.Services.Implementations;
using BookStore.API.Helpers; 
using BookStore.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Đăng ký Dependency Injection (DI) cho Repositories & Services
builder.Services.AddScoped<IKhachHangRepository, KhachHangRepository>();
builder.Services.AddScoped<INhanVienRepository, NhanVienRepository>();
builder.Services.AddScoped<ISachRepository, SachRepository>();
builder.Services.AddScoped<IGioHangRepository, GioHangRepository>();
builder.Services.AddScoped<IHoaDonRepository, HoaDonRepository>();

// Đăng ký DI cho Nhật ký hoạt động (Activity Log)
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddSingleton<JwtTokenGenerator>();

// Đăng ký dịch vụ SignalR cho hệ thống Real-time
builder.Services.AddSignalR();

// Cấu hình Controller và JSON để tránh lỗi vòng lặp (Object Cycle)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 3. Cấu hình xác thực JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("SecretKey missing in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
    };
});

// 4. Cấu hình CORS (Cho phép mọi nguồn gọi API & kết nối WebSocket của SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Cho phép tất cả các nguồn gọi (Localhost, IP AWS, Domain...)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Cấu hình Swagger API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookStore API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Name = "Authorization", Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
    });
});

var app = builder.Build();

// 6. Tự động Migrate để bổ sung các bảng còn thiếu
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try 
    {
        db.Database.Migrate(); 
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CẢNH BÁO MIGRATION]: {ex.Message}");
    }
}

// Bật Swagger
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API v1"));

app.UseHttpsRedirection();

// Cấp phép CORS (Phải đặt trước UseAuthorization và MapControllers)
app.UseCors("AllowAll"); 

// Cho phép truy cập file tĩnh (hiển thị ảnh sách trong thư mục wwwroot)
app.UseStaticFiles(); 

// Thứ tự Middleware xác thực
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Định tuyến đường dẫn kết nối SignalR Hub cho Client (ReactJS)
app.MapHub<NotificationHub>("/notificationHub");

app.Run();