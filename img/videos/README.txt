HOW TO ADD YOUR VIDEOS
=======================

1) Drop your video files in this folder (MP4 or WebM).

2) Open js/projects-data.js and add a video entry to a project's "media" list:

   { "type": "video", "src": "img/videos/your-file.mp4", "poster": "img/work/Social/2.jpg" }

   - "poster" is optional: the thumbnail shown before playback.
   - Videos automatically appear under the "Video" filter category
     (they are kept separate and are not mixed into the photo categories).

NOTE — DEMO VIDEOS
------------------
The "Video Edits" project currently contains two entries marked "demo": true
that point to a public sample video (works online). Replace their "src" (and
"poster") with your own files, e.g.:

   { "type": "video", "src": "img/videos/reel-1.mp4", "poster": "img/work/Social/2.jpg" }
