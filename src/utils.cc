#include <filesystem>
#include <string>

#ifdef _WIN32
#include <windows.h>
#elif defined(__APPLE__)
#include <mach-o/dyld.h>
#else // Linux
#include <unistd.h>
#include <limits.h>
#endif

std::string GetExecutablePath() {
    std::filesystem::path executablePath;

#ifdef _WIN32
    // Windows implementation
    wchar_t path[MAX_PATH] = { 0 };
    GetModuleFileNameW(NULL, path, MAX_PATH);
    executablePath = path;
#elif defined(__APPLE__)
    // macOS implementation
    char path[PATH_MAX];
    uint32_t size = sizeof(path);
    if (_NSGetExecutablePath(path, &size) == 0) {
        executablePath = std::filesystem::path(path);
    }
#else // Linux
    // Linux implementation
    char path[PATH_MAX];
    ssize_t count = readlink("/proc/self/exe", path, PATH_MAX);
    if (count != -1) {
        path[count] = '\0';
        executablePath = std::filesystem::path(path);
    }
#endif

    return executablePath.string();
}

// Get just the directory where the executable is located
std::string GetExecutableDir() {
    return std::filesystem::path(GetExecutablePath()).parent_path().string();
}
