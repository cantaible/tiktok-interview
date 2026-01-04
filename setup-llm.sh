#!/bin/bash

# 阿里云百炼 LLM 快速配置脚本

echo "🚀 阿里云百炼 LLM 配置向导"
echo "================================"
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "📝 请输入你的阿里云百炼凭证："
echo ""

# 读取 API Key
read -p "API Key (ALIYUN_BAILIAN_API_KEY): " api_key
if [ -z "$api_key" ]; then
    echo "❌ API Key 不能为空"
    exit 1
fi

# 读取 Workspace ID
read -p "Workspace ID (ALIYUN_BAILIAN_WORKSPACE_ID): " workspace_id
if [ -z "$workspace_id" ]; then
    echo "❌ Workspace ID 不能为空"
    exit 1
fi

# 创建 .env.local 文件
echo ""
echo "📄 创建 .env.local 文件..."
cat > .env.local << EOF
# 阿里云百炼 API 配置
# 由 setup-llm.sh 自动生成于 $(date)

ALIYUN_BAILIAN_API_KEY=$api_key
ALIYUN_BAILIAN_WORKSPACE_ID=$workspace_id
EOF

# 验证文件创建
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件创建成功"
    echo ""
    echo "📋 配置内容："
    echo "-----------------------------------"
    echo "API Key: ${api_key:0:20}..."
    echo "Workspace ID: ${workspace_id:0:20}..."
    echo "-----------------------------------"
else
    echo "❌ 文件创建失败"
    exit 1
fi

# 添加到 .gitignore
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "✅ 已添加 .env.local 到 .gitignore"
fi

echo ""
echo "🎉 配置完成！"
echo ""
echo "📌 下一步："
echo "1. 重启开发服务器: npm run dev"
echo "2. 访问 http://localhost:3000"
echo "3. 点击 'Fetch News Now' 测试 LLM 功能"
echo ""
echo "🔍 验证配置："
echo "查看控制台是否显示 '🤖 Enriching X articles with LLM...'"
echo ""
echo "📚 更多信息请查看 LLM_SETUP_GUIDE.md"
