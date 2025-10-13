# Auto-Config API Script

This script automatically detects your local IP address and updates the API base URL in `Frontend/config.ts`.

## Usage

```bash
./auto-config-api.sh
```

## What it does

1. **Detects your local IP address** using multiple methods:
   - `hostname -I` (Linux)
   - `ip route` command
   - `ifconfig` command
   - `networksetup` (macOS)

2. **Updates `Frontend/config.ts`** with the correct API base URL in the format:
   ```
   http://YOUR_LOCAL_IP:8080
   ```

3. **Creates a backup** of the original config file before making changes

## When to use

- When your local IP address changes (switching networks, VPN, etc.)
- When setting up the project on a new machine
- When the backend IP is not accessible from the current network configuration

## Manual override

If you need to use a different URL (tunnel service, different port, etc.), you can still manually edit `Frontend/config.ts`:

```typescript
export const API_BASE = 'https://your-tunnel-url.com';
// or
export const API_BASE = 'http://localhost:8080';
// or any other URL
```

## Troubleshooting

- **Script can't detect IP**: Check your network connection
- **Backend not accessible**: Make sure the backend is running on port 8080
- **Permission denied**: Run `chmod +x auto-config-api.sh` to make the script executable