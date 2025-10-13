#!/bin/bash

# Script to automatically detect and set the API base URL in config.ts
# This script finds the local IP address and updates the Frontend config.ts file

set -e

# Function to get local IP address
get_local_ip() {
    # Try different methods to get the local IP
    local ip=""

    # Method 1: Use hostname command
    if command -v hostname >/dev/null 2>&1; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    # Method 2: Use ip route command
    if [ -z "$ip" ] && command -v ip >/dev/null 2>&1; then
        ip=$(ip route get 8.8.8.8 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
    fi

    # Method 3: Use ifconfig command
    if [ -z "$ip" ] && command -v ifconfig >/dev/null 2>&1; then
        ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | sed 's/addr://')
    fi

    # Method 4: Use networksetup on macOS
    if [ -z "$ip" ] && command -v networksetup >/dev/null 2>&1; then
        ip=$(networksetup -getinfo Wi-Fi 2>/dev/null | grep -E '^IP address:' | awk '{print $3}')
        if [ -z "$ip" ]; then
            ip=$(networksetup -getinfo Ethernet 2>/dev/null | grep -E '^IP address:' | awk '{print $3}')
        fi
    fi

    echo "$ip"
}

# Get the local IP address
LOCAL_IP=$(get_local_ip)

if [ -z "$LOCAL_IP" ]; then
    exit 1
fi

# Set the API base URL
API_BASE="http://${LOCAL_IP}:8080"

# Path to config.ts
CONFIG_FILE="./Frontend/config.ts"

if [ ! -f "$CONFIG_FILE" ]; then
    exit 1
fi

# Backup the original file
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"

# Update the API_BASE in config.ts
if sed -i.bak "s|export const API_BASE = '[^']*';|export const API_BASE = '${API_BASE}';|" "$CONFIG_FILE"; then
    # Show the updated line
    grep "export const API_BASE" "$CONFIG_FILE"
else
    # Restore backup
    mv "${CONFIG_FILE}.backup" "$CONFIG_FILE" 2>/dev/null || true
    exit 1
fi

# Clean up backup file created by sed
rm -f "${CONFIG_FILE}.bak"