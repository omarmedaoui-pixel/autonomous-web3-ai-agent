#!/bin/bash
# Web3 AI Agent - CLI Demo Script
# This script demonstrates all CLI features

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Web3 AI Agent - CLI Demo                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if in the correct directory
if [ ! -f "agent/agent.js" ]; then
    echo "❌ Error: Please run this script from the web3-ai-agent directory"
    exit 1
fi

echo "📋 Demo Menu:"
echo ""
echo "1. Show help"
echo "2. Deploy contract and execute single task"
echo "3. Execute batch tasks (comma-separated)"
echo "4. Execute tasks from file"
echo "5. Deploy and execute with monitoring"
echo ""
read -p "Select an option (1-5): " choice

case $choice in
    1)
        echo ""
        node agent/agent.js --help
        ;;
    2)
        echo ""
        echo "🎯 Demo: Deploy contract and execute task"
        echo "=========================================="
        node agent/agent.js "Analyze ETH price trends and generate trading signals" --deploy
        ;;
    3)
        echo ""
        echo "📦 Demo: Execute batch tasks"
        echo "============================"
        node agent/agent.js "Monitor ETH price,Analyze DeFi yields,Generate trading signals" --batch --deploy
        ;;
    4)
        echo ""
        echo "📄 Demo: Execute tasks from file"
        echo "================================"
        node agent/agent.js --file tasks.example.txt --deploy
        ;;
    5)
        echo ""
        echo "👁️  Demo: Deploy and monitor events"
        echo "===================================="
        echo "⚠️  This will keep running. Press Ctrl+C to stop."
        echo ""
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            node agent/agent.js "Monitor market conditions" --deploy --monitor
        else
            echo "Skipped."
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Demo completed!"
echo ""
echo "💡 For more information, see:"
echo "   - CLI Quick Reference: CLI_QUICK_REF.md"
echo "   - Full Guide: AGENT_CLI_GUIDE.md"
echo "   - Main README: README.md"
