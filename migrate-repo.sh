#!/bin/bash

# Script để chuyển repository sang GitHub account mới
# Sử dụng: ./migrate-repo.sh

echo "🚀 Script Chuyển Repository"
echo "=============================="
echo ""

# Kiểm tra xem có đang trong git repository không
if [ ! -d ".git" ]; then
    echo "❌ Không tìm thấy .git folder. Đảm bảo bạn đang ở thư mục gốc của project."
    exit 1
fi

# Hiển thị remote hiện tại
echo "📋 Remote hiện tại:"
git remote -v
echo ""

# Hỏi URL repository mới
read -p "Nhập URL repository mới của bạn (ví dụ: https://github.com/your-username/samurai-japanese-app.git): " NEW_REPO_URL

if [ -z "$NEW_REPO_URL" ]; then
    echo "❌ URL không được để trống!"
    exit 1
fi

# Xác nhận
echo ""
echo "⚠️  Bạn sắp thay đổi remote sang: $NEW_REPO_URL"
read -p "Bạn có chắc chắn? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Đã hủy."
    exit 0
fi

# Xóa remote cũ
echo ""
echo "🗑️  Đang xóa remote cũ..."
git remote remove origin 2>/dev/null || echo "   (Không có remote 'origin' để xóa)"

# Thêm remote mới
echo "➕ Đang thêm remote mới..."
git remote add origin "$NEW_REPO_URL"

# Kiểm tra lại
echo ""
echo "✅ Remote mới:"
git remote -v
echo ""

# Hỏi có muốn push không
read -p "Bạn có muốn push code lên repository mới ngay bây giờ? (y/n): " PUSH_NOW

if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
    echo ""
    echo "📤 Đang push code..."
    
    # Lấy tên branch hiện tại
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Push
    git push -u origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Hoàn thành! Code đã được push lên repository mới."
    else
        echo ""
        echo "❌ Có lỗi xảy ra khi push. Kiểm tra lại URL và quyền truy cập."
    fi
else
    echo ""
    echo "ℹ️  Remote đã được cập nhật. Bạn có thể push sau bằng lệnh:"
    echo "   git push -u origin <branch-name>"
fi

echo ""
echo "✨ Xong!"

