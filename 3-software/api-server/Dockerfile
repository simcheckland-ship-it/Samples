# Dockerfile
# Language: Dockerfile

# Step 0: Define build-time argument for base image with valid default
ARG IMAGE_BASE_RUNTIME=mcr.microsoft.com/dotnet/aspnet:8.0
ARG IMAGE_BASE_SDK=mcr.microsoft.com/dotnet/sdk:8.0

# Step 1: Runtime image for lightweight execution
FROM ${IMAGE_BASE_RUNTIME} AS base
WORKDIR /app
EXPOSE 8080

# Step 2: SDK image to build the application
FROM ${IMAGE_BASE_SDK} AS build
WORKDIR /src

# Step 1: Set up workspace
WORKDIR /src

# Step 2: Copy the project file into a matching subfolder layout and restore
COPY ["PhotoWepApi/PhotoWepApi.csproj", "PhotoWepApi/"]
RUN dotnet restore "PhotoWepApi/PhotoWepApi.csproj"

# Step 3: Copy all other source files down
COPY . .

# Step 4: Step into the subfolder to run your build and publish commands
WORKDIR "/src/PhotoWepApi"
RUN dotnet build "PhotoWepApi.csproj" -c Release -o /app/build

# Step 5: Publish optimized binaries
FROM build AS publish
RUN dotnet publish "PhotoWepApi.csproj" -c Release -o /app/publish /p:UseAppHost=false


# Step 4: Assemble final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish ./
ENTRYPOINT ["dotnet", "PhotoWepApi.dll"]
