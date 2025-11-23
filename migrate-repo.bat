@echo off
REM Script để chuyển repository sang GitHub account mới (Windows)
REM Sử dụng: migrate-repo.bat

echo 🚀 Script Chuyển Repository
echo ==============================
echo.

REM Kiểm tra xem có đang trong git repository không
if not exist ".git" (
    echo ❌ Không tìm thấy .git folder. Đảm bảo bạn đang ở thư mục gốc của project.
    pause
    exit /b 1
)

REM Hiển thị remote hiện tại
echo 📋 Remote hiện tại:
git remote -v
echo.

REM Hỏi URL repository mới
set /p NEW_REPO_URL="Nhập URL repository mới của bạn (ví dụ: https://github.com/your-username/samurai-japanese-app.git): "

if "%NEW_REPO_URL%"=="" (
    echo ❌ URL không được để trống!
    pause
    exit /b 1
)

REM Xác nhận
echo.
echo ⚠️  Bạn sắp thay đổi remote sang: %NEW_REPO_URL%
set /p CONFIRM="Bạn có chắc chắn? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo ❌ Đã hủy.
    pause
    exit /b 0
)

REM Xóa remote cũ
echo.
echo 🗑️  Đang xóa remote cũ...
git remote remove origin 2>nul || echo    (Không có remote 'origin' để xóa)

REM Thêm remote mới
echo ➕ Đang thêm remote mới...
git remote add origin "%NEW_REPO_URL%"

REM Kiểm tra lại
echo.
echo ✅ Remote mới:
git remote -v
echo.

REM Hỏi có muốn push không
set /p PUSH_NOW="Bạn có muốn push code lên repository mới ngay bây giờ? (y/n): "

if /i "%PUSH_NOW%"=="y" (
    echo.
    echo 📤 Đang push code...
    
    REM Lấy tên branch hiện tại
    for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
    
    REM Push
    git push -u origin %CURRENT_BRANCH%
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Hoàn thành! Code đã được push lên repository mới.
    ) else (
        echo.
        echo ❌ Có lỗi xảy ra khi push. Kiểm tra lại URL và quyền truy cập.
    )
) else (
    echo.
    echo ℹ️  Remote đã được cập nhật. Bạn có thể push sau bằng lệnh:
    echo    git push -u origin ^<branch-name^>
)

echo.
echo ✨ Xong!
pause

