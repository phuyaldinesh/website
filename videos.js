document.addEventListener('DOMContentLoaded', () => {
    const videos = [
        'Background/Video (1).mp4',
        'Background/Video (2).mp4',
        'Background/Video (3).mp4',
        'Background/Video (4).mp4',
        'Background/Video (5).mp4',
        'Background/Video (6).mp4',
        'Background/Video (7).mp4',
        'Background/Video (8).mp4',
        'Background/Video (9).mp4',
        'Background/Video (10).mp4',
        'Background/Video (11).mp4',
        'Background/Video (12).mp4',
        'Background/Video (13).mp4',
        'Background/Video (14).mp4',
        'Background/Video (15).mp4',
        'Background/Video (16).mp4',
        'Background/Video (17).mp4',
    ];
    const randomIndex = Math.floor(Math.random() * videos.length);
    const randomVideo = videos[randomIndex];
    const videoElement = document.getElementById('background-video');

    if (!videoElement) {
        console.error('Error: #background-video element not found in the document.');
        return;
    }

    const sourceElement = videoElement.querySelector('source');
    if (!sourceElement) {
        console.error('Error: <source> element not found inside #background-video.');
        return;
    }

    sourceElement.src = randomVideo;
    sourceElement.type = 'video/mp4'; // Explicitly set the MIME type
    videoElement.load();
    videoElement.play().catch(error => {
        console.warn('Autoplay failed, likely due to browser restrictions:', error);
        // Fallback: Hide video and use background color (optional)
        videoElement.style.display = 'none';
        document.body.style.backgroundColor = '#f6f5f2'; // Match theme.css background
    });
    console.log('Playing video:', randomVideo);
});