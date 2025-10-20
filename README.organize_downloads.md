# Downloads Organizer (Python)

This script organizes your Downloads folder by keywords (e.g., "resume", "invoice") and file types (images, documents, videos, code, archives, etc.). It safely creates folders, skips temp/system files, and prevents overwriting by renaming duplicates.

## Quick start (Windows PowerShell)

- Dry run (no changes):

```powershell
python organize_downloads.py --dry-run
```

- Actually move files, verbose output:

```powershell
python organize_downloads.py --verbose
```

- Organize a specific folder and place results there:

```powershell
python organize_downloads.py --source "D:\\Downloads" --dest "D:\\Downloads" --verbose
```

- Recurse into subfolders as well:

```powershell
python organize_downloads.py -r -v
```

## What it does

- Keyword routing takes precedence (e.g., files with names containing `resume`, `invoice`, `tax`, `ticket`, `syllabus`, etc.).
- Otherwise, it sorts by extension into categories like `Pictures`, `Documents`, `Videos`, `Music`, `Archives`, `Code`, `Installers`, `Fonts`, `3D`, `Design`, `Torrents`, `Disk Images`, and a general `Other` folder when no match.
- Skips incomplete temp files: `.crdownload`, `.part`, `.tmp` and system files like `desktop.ini`.
- Won't move files already in their correct category folder.
- Adds " (1)", "(2)", ... to filenames to prevent overwriting when duplicates exist.

## Options

- `--source, -s`  Source folder to organize (default: `~/Downloads`)
- `--dest, -d`    Destination root (default: same as `--source`)
- `--recursive, -r`  Scan subfolders recursively
- `--dry-run, -n` Preview actions without moving
- `--verbose, -v` Print each planned move

## Notes

- You can customize keywords and categories by editing `build_keyword_mapping()` and `build_extension_mapping()` in `organize_downloads.py`.
- Moving large files across drives may take time; run with `--dry-run` first to preview.
- The script is self-contained and requires only the Python standard library.
