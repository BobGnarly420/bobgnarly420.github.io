# Music Portfolio Admin Guide

## 🔒 Security & Privacy First

This guide will help you securely manage your music content on your portfolio site while protecting your privacy.

## Quick Start

### 1. Open the Local Admin Tool

1. Open `music-admin.html` in your web browser
2. **IMPORTANT**: This file should NEVER be committed to Git (it's in .gitignore)
3. This tool runs entirely in your browser - no data is sent to any server

### 2. Load Your Existing Music Data

1. Click "Choose File" and select `music-data.json` from your project folder
2. Your existing tracks will load into the editor

### 3. Add or Edit Music Tracks

For each track, you can add:

- **Title*** (Required): The name of your song/track
- **Type/Genre*** (Required): e.g., "Electronic", "Hip-Hop", "Indie Folk"
- **Year**: Release year
- **Description**: Brief description of the track
- **External Link**: URL to streaming platforms (SoundCloud, Bandcamp, Spotify, YouTube)
- **Embed Code**: Embed player from streaming platforms

### 4. Export and Update

1. Click "💾 Export JSON File" button
2. Save the file as `music-data.json`
3. Replace the existing `music-data.json` in your project
4. Commit and push to GitHub

## 🛡️ Privacy & Security Best Practices

### DO:
✅ Host music files on external platforms (SoundCloud, Bandcamp, YouTube, Spotify)
✅ Use only trusted embed codes from verified platforms
✅ Review all data before committing to GitHub
✅ Keep personal information you don't want public out of descriptions
✅ Use the admin tool locally only

### DON'T:
❌ Include personal contact information in descriptions
❌ Upload large audio files directly to GitHub
❌ Commit the `music-admin.html` file to Git
❌ Use embed codes from unknown/untrusted sources
❌ Share your admin tool with untrusted parties

## Supported Music Platforms

The admin tool validates embed codes from these trusted platforms:

- **SoundCloud** (soundcloud.com)
- **Bandcamp** (bandcamp.com)
- **YouTube** (youtube.com, youtube-nocookie.com)
- **Spotify** (spotify.com, open.spotify.com)

## How to Get Embed Codes

### SoundCloud
1. Go to your track on SoundCloud
2. Click "Share" button
3. Click "Embed" tab
4. Copy the `<iframe>` code
5. Paste into "Embed Code" field in admin tool

### Bandcamp
1. Go to your album/track on Bandcamp
2. Click "Share/Embed" button
3. Copy the embed code
4. Paste into admin tool

### YouTube
1. Go to your video on YouTube
2. Click "Share" → "Embed"
3. Copy the `<iframe>` code
4. Paste into admin tool

### Spotify
1. Go to your track on Spotify web player
2. Click "..." → "Share" → "Embed track"
3. Copy the embed code
4. Paste into admin tool

## Security Features

The admin tool includes several security protections:

1. **Input Sanitization**: All text inputs are sanitized to prevent XSS attacks
2. **URL Validation**: External links are validated to ensure proper URLs
3. **Embed Validation**: Only allows embeds from trusted music platforms
4. **Local-Only**: No data leaves your computer - everything runs in your browser
5. **Git Protection**: Admin tool is in .gitignore to prevent accidental commits

## Workflow Example

```bash
# 1. Make your changes using music-admin.html
# 2. Export the new music-data.json

# 3. Check what changed
git diff music-data.json

# 4. If everything looks good, commit
git add music-data.json
git commit -m "Update music portfolio with new tracks"

# 5. Push to GitHub
git push
```

## File Structure

```
bobgnarly420.github.io/
├── index.html                 # Your portfolio site (uses music-data.json)
├── music-data.json           # Your music content (commit this)
├── music-admin.html          # Admin tool (DO NOT commit)
├── .gitignore               # Protects admin tool from being committed
└── MUSIC-ADMIN-GUIDE.md     # This guide
```

## Troubleshooting

### Issue: Music not showing on website
- Check that `music-data.json` is in the root directory
- Verify the JSON format is valid (use the Preview button in admin tool)
- Check browser console for errors

### Issue: Embed not working
- Verify the platform is in the trusted list
- Make sure you copied the complete `<iframe>` tag
- Try using the direct link instead

### Issue: Changes not appearing after push
- Clear your browser cache
- Wait a few minutes for GitHub Pages to rebuild
- Check that you pushed to the correct branch

## Privacy Checklist

Before committing, review your music-data.json:

- [ ] No personal email addresses
- [ ] No phone numbers
- [ ] No home addresses
- [ ] No sensitive personal information
- [ ] All external links are correct
- [ ] All embeds are from trusted platforms
- [ ] Content is ready to be public

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Validate your JSON using the "Preview Data" button
3. Ensure all required fields (Title, Type) are filled
4. Verify embed codes are from supported platforms

## Advanced: Manual JSON Editing

If you prefer to edit the JSON directly:

```json
{
  "music": [
    {
      "id": 1,
      "title": "Your Track Title",
      "type": "Genre",
      "year": "2024",
      "description": "Description of your track",
      "link": "https://soundcloud.com/your-track",
      "embedCode": "<iframe src='...'></iframe>"
    }
  ]
}
```

**Note**: If editing manually, ensure:
- Valid JSON syntax
- Unique IDs for each track
- All strings are properly escaped
- URLs are complete and valid
