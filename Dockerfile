# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the .csproj file and restore dependencies first
# This leverages Docker's layer caching
COPY backend/TapAndTrack.csproj backend/
RUN dotnet restore "backend/TapAndTrack.csproj"

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Publish the application for release
WORKDIR "/src/backend"
RUN dotnet publish "TapAndTrack.csproj" -c Release -o /app/publish

# Stage 2: Create the final, smaller runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway provides the PORT environment variable. This command makes the app listen on it.
CMD ASPNETCORE_URLS=http://+:$PORT dotnet TapAndTrack.dll