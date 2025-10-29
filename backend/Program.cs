using Supabase;
using TapAndTrack.Models;

var builder = WebApplication.CreateBuilder(args);

var supabaseUrl = builder.Configuration["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE__URL") ?? "";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? Environment.GetEnvironmentVariable("SUPABASE__KEY") ?? "";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// ✅ CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://tapandtrack.vercel.app",
                "https://tapandtrackapp.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
            // .AllowCredentials(); // only if needed
    });
});

// Supabase client
builder.Services.AddSingleton<Supabase.Client>(provider =>
{
    var client = new Supabase.Client(
        supabaseUrl,
        supabaseKey,
        new SupabaseOptions
        {
            AutoConnectRealtime = false,
            AutoRefreshToken = false
        }
    );
    return client;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ Apply named CORS policy
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
