using Supabase;
using TapAndTrack.Models;

var builder = WebApplication.CreateBuilder(args);

var supabaseUrl = builder.Configuration["Supabase:Url"] ?? Environment.GetEnvironmentVariable("Supabase__Url") ?? "";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? Environment.GetEnvironmentVariable("Supabase__Key") ?? "";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://tapandtrack.vercel.app", // Example URL
                "https://tapandtrackapp.vercel.app" // Your actual production URL
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

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

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
