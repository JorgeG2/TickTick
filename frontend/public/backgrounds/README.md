# Custom Pomodoro backgrounds

Drop image or video files here (`.jpg`, `.png`, `.webp`, `.mp4`, `.webm`), then
open `/pomodoro`, click the image button in the top right, choose **Custom**, and
enter the path:

```
/backgrounds/my-clip.mp4
```

Videos play muted and looped, so long ambient loops work best. To make a file a
permanent entry in the picker instead of a one-off custom URL, add it to
`PHOTO_BACKGROUNDS` or `VIDEO_BACKGROUNDS` in `src/lib/backgrounds.ts`.
