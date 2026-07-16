using System.Text;
using BookStore.API.Data;
using BookStore.API.Data.Seed;
using BookStore.API.Helpers;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Repositories.Implementations;
using BookStore.API.Services.Interfaces;
using BookStore.API.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ===== 1. Database (SQL Server qua EF Core) =====
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== 2. Dependency Injection - Tầng Repository & Service =====
builder.Services.AddScoped<IKhachHangRepository, KhachHangRepository>();
builder.Services.AddScoped<INhanVienRepository, NhanVienRepository>();
builder.Services.AddScoped<ISachRepository, SachRepository>();
builder.Services.AddScoped<IGioHangRepository, GioHangRepository>();
builder.Services.AddScoped<IHoaDonRepository, HoaDonRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddSingleton<JwtTokenGenerator>();

// ===== 3. Controllers =====
builder.Services.AddControllers();

// ===== 4. JWT Authentication =====
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false; // Giữ nguyên tên claim "sub" thay vì map sang ClaimTypes.NameIdentifier
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ===== 5. CORS - Cho phép frontend React (Vite) gọi API =====
const string CorsPolicy = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173" // Cổng mặc định của Vite
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ===== 6. Swagger (Tài liệu API & Test bảo mật) =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "BookStore API", Version = "v1" });

    // Cấu hình chuẩn để Swagger nhận diện JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        // Đã cập nhật dòng mô tả để tránh nhầm lẫn khi nhập Token
        Description = "CHỈ DÁN NGUYÊN CHUỖI TOKEN VÀO ĐÂY (KHÔNG cần gõ thêm chữ Bearer)."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Đọc file XML comment để hiện mô tả của từng API trên Swagger UI
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// ===== 7. Khởi tạo Pipeline =====
if (app.Environment.IsDevelopment())
{
    // Chạy Seed dữ liệu test
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    DbSeeder.SeedTestAccounts(db);

    app.UseSwagger();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API v1"));
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication(); // Bắt buộc nằm trước UseAuthorization
app.UseAuthorization();
app.MapControllers();

app.Run();