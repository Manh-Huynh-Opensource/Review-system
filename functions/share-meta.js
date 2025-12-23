const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Ensure admin is initialized (it might be initialized in index.js, but safe to check/init)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

// Template for the simple HTML we'll serve
// We use a simple redirect script to send the user to the actual app after scraping
const getHtml = (title, image, url) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="Chia sẻ từ Freelance Flow - Review System">
    ${image ? `<meta property="og:image" content="${image}">` : ''}

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="Chia sẻ từ Freelance Flow - Review System">
    ${image ? `<meta property="twitter:image" content="${image}">` : ''}

    <!-- Redirect to actual app -->
    <script>
      window.location.href = "${url}";
    </script>
</head>
<body>
    <h1>Đang chuyển hướng...</h1>
    <p>Nếu không tự động chuyển, vui lòng <a href="${url}">nhấn vào đây</a>.</p>
</body>
</html>
`;

exports.shareMeta = functions.https.onRequest(async (req, res) => {
    // Path format expected: /share/p/:projectId or /share/p/:projectId/file/:fileId
    // We can just look at the request path segments
    const pathParts = req.path.split('/').filter(p => p);

    // Logic to parse IDs from path
    // Example path: /p/PROJECT_ID or /p/PROJECT_ID/file/FILE_ID
    // We assume the rewritten URL is passed here

    let projectId = null;
    let fileId = null;

    // Simple parsing based on checking segments
    // Assuming route path is like /share/p/...
    const pIndex = pathParts.indexOf('p');
    if (pIndex !== -1 && pathParts[pIndex + 1]) {
        projectId = pathParts[pIndex + 1];
    }

    const fIndex = pathParts.indexOf('file');
    if (fIndex !== -1 && pathParts[fIndex + 1]) {
        fileId = pathParts[fIndex + 1];
    }

    // console.log('Parsed:', { projectId, fileId, path: req.path });

    if (!projectId) {
        return res.status(404).send('Not Found');
    }

    try {
        let title = 'Freelance Flow Review';
        let image = null;

        if (fileId) {
            // Fetch File Data
            const fileDoc = await db.collection('projects').doc(projectId).collection('files').doc(fileId).get();
            if (fileDoc.exists) {
                const data = fileDoc.data();
                title = data.name || 'File';

                // Find best thumbnail
                const currentVersion = data.currentVersion || 1;
                const versionData = data.versions?.find(v => v.version === currentVersion);

                if (versionData) {
                    image = versionData.thumbnail || versionData.poster || versionData.url; // Fallback to URL if image type
                }
            }
        } else {
            // Fetch Project Data
            const projectDoc = await db.collection('projects').doc(projectId).get();
            if (projectDoc.exists) {
                const data = projectDoc.data();
                title = data.name || 'Dự án';
                // Project might not have a thumbnail, maybe use logo or generic
            }
        }

        // Construct the destination URL (the Vercel app URL)
        // We redirect to the Vercel hosted version
        let appUrl = 'https://view.manhhuynh.work';

        if (fileId) {
            appUrl = `${appUrl}/review/${projectId}/file/${fileId}`;
        } else {
            appUrl = `${appUrl}/review/${projectId}`;
        }

        // Check if user agent is a bot
        const userAgent = req.headers['user-agent'] || '';
        const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|skype|slack/i.test(userAgent);

        if (isBot) {
            res.status(200).send(getHtml(title, image, appUrl));
        } else {
            // Direct redirect for humans (faster)
            res.redirect(appUrl);
        }

    } catch (error) {
        console.error('Error serving meta:', error);
        res.status(500).send('Internal Server Error');
    }
});
