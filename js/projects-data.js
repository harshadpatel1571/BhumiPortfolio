// =====================================
// Portfolio Data — THE single data file
// =====================================
// This is the one and only place to manage the portfolio content. It loads
// as a normal script (see index.html), so it works in every situation:
//   * opening index.html directly from disk (file://)
//   * a local server (Live Server, python -m http.server, ...)
//   * real hosting
//
// Media item format:
//   { "type": "image", "src": "img/work/..." }
//   { "type": "video", "src": "img/videos/..." , "poster": "img/work/..." }
//
// How categories work (everything is data-driven):
//   * The category line under "Featured Portfolio" is built from this data —
//     one button per unique "category", named by "categoryName".
//   * Menu order = id order: the smallest "id" shows first. To move a
//     category, change its "id" — e.g. Video has the biggest id, so it sits
//     last. Projects without an id go to the very end.
//   * Keep all projects of the same category together.
//   * A category with no media yet still shows its button and displays a
//     friendly "No work added yet".
//   * "hidden": true keeps a category in the data but out of the menu.
//   * All videos live in the "video" category — no need to repeat that rule:
//     every media item of type "video" automatically shows up under Video,
//     and photo categories never show videos.
// =====================================

const portfolioData = [
    {
        "id": 1,
        "category": "branding",
        "categoryName": "Brand Identity",
        "title": "Modern Brand Identity",
        "description": "Complete branding packages for startups and growing businesses.",
        "client": "Multiple Startups",
        "date": "December 2023",
        "tools": "Illustrator, Photoshop",
        "hidden": true,
        "coverImage": "img/work/Brand Section.jpg",
        "media": [
            { "type": "image", "src": "img/work/Brand Section.jpg" },
            { "type": "image", "src": "img/work/Logo/01.jpg" },
            { "type": "image", "src": "img/work/Logo/02.jpg" }
        ]
    },
    {
        "id": 1,
        "category": "logo",
        "categoryName": "Logo Design",
        "title": "Logo Design Collection",
        "description": "Distinct, memorable identities for diverse brands.",
        "client": "Multiple Businesses",
        "date": "September 2023",
        "tools": "Adobe Illustrator, CorelDRAW",
        "coverImage": "img/work/Logo Section.jpg",
        "media": [
            { "type": "image", "src": "img/work/Logo/01.jpg" },
            { "type": "image", "src": "img/work/Logo/02.jpg" },
            { "type": "image", "src": "img/work/Logo/03.jpg" },
            { "type": "image", "src": "img/work/Logo/04.jpg" },
            { "type": "image", "src": "img/work/Logo/05.jpg" },
            { "type": "image", "src": "img/work/Logo/06.jpg" },
            { "type": "image", "src": "img/work/Logo/07.jpg" },
            { "type": "image", "src": "img/work/Logo/08.jpg" }
        ]
    },
    {
        "id": 2,
        "category": "uiux",
        "categoryName": "UI UX Design",
        "title": "Mobile App Interface",
        "description": "Modern, user-friendly interface design.",
        "client": "AppDev Studio",
        "date": "February 2024",
        "tools": "Figma, Adobe XD, Photoshop",
        "coverImage": "img/work/UIUX Section.jpg",
        "media": [
            { "type": "image", "src": "img/work/UIUX Section.jpg" }
        ]
    },
    {
        "id": 3,
        "category": "social",
        "categoryName": "Social Media",
        "title": "Engaging Social Media Posts",
        "description": "Creative digital content designed to stop the scroll.",
        "client": "Digital Marketing Agency",
        "date": "January 2024",
        "tools": "Canva, Photoshop, Figma",
        "coverImage": "img/work/Social Section.png",
        "media": [
            { "type": "image", "src": "img/work/Social/17.jpg" },
            { "type": "image", "src": "img/work/Social/18.jpg" },
            { "type": "image", "src": "img/work/Social/19.jpg" },
            { "type": "image", "src": "img/work/Social/20.jpg" },
            { "type": "image", "src": "img/work/Social/21.jpg" },
            { "type": "image", "src": "img/work/Social/22.jpg" },
            { "type": "image", "src": "img/work/Social/23.jpg" },
            { "type": "image", "src": "img/work/Social/24.jpg" },
            { "type": "image", "src": "img/work/Social/25.jpg" },
            { "type": "image", "src": "img/work/Social/26.jpg" },
            { "type": "image", "src": "img/work/Social/27.jpg" },
            { "type": "image", "src": "img/work/Social/28.jpg" },
            { "type": "image", "src": "img/work/Social/29.jpg" },
            { "type": "image", "src": "img/work/Social/30.jpg" },
            { "type": "image", "src": "img/work/Social/31.jpg" },
            { "type": "image", "src": "img/work/Social/32.jpg" },
            { "type": "image", "src": "img/work/Social/33.jpg" },
            { "type": "image", "src": "img/work/Social/34.jpg" },
            { "type": "image", "src": "img/work/Social/35.jpg" },
            { "type": "image", "src": "img/work/Social/36.jpg" },
            { "type": "image", "src": "img/work/Social/37.jpg" },
            { "type": "image", "src": "img/work/Social/38.jpg" },
            { "type": "image", "src": "img/work/Social/39.jpg" },
            { "type": "image", "src": "img/work/Social/40.jpg" },
            { "type": "image", "src": "img/work/Social/41.jpg" },
            { "type": "image", "src": "img/work/Social/42.jpg" },
            { "type": "image", "src": "img/work/Social/43.jpg" },
            { "type": "image", "src": "img/work/Social/44.jpg" },
            { "type": "image", "src": "img/work/Social/45.jpg" },
            { "type": "image", "src": "img/work/Social/46.jpg" },
            { "type": "image", "src": "img/work/Social/47.jpg" },
            { "type": "image", "src": "img/work/Social/48.jpg" },
            { "type": "image", "src": "img/work/Social/49.jpg" },
            { "type": "image", "src": "img/work/Social/50.jpg" },
            { "type": "image", "src": "img/work/Social/51.jpg" },
            { "type": "image", "src": "img/work/Social/52.jpg" },
            { "type": "image", "src": "img/work/Social/54.jpg" }
        ]
    },
    {
        "id": 4,
        "category": "beauty",
        "categoryName": "Beauty Studio",
        "title": "Elegant Beauty Studio Posts",
        "description": "Premium social media creatives for beauty brands.",
        "client": "Glamour Beauty Lounge",
        "date": "November 2023",
        "tools": "Photoshop, Illustrator, Canva",
        "coverImage": "img/work/Beauty Section.jpg",
        "media": [
            { "type": "image", "src": "img/work/Beauty/01.jpg" },
            { "type": "image", "src": "img/work/Beauty/02.jpg" },
            { "type": "image", "src": "img/work/Beauty/03.jpg" },
            { "type": "image", "src": "img/work/Beauty/04.jpg" },
            { "type": "image", "src": "img/work/Beauty/05.jpg" },
            { "type": "image", "src": "img/work/Beauty/06.jpg" },
            { "type": "image", "src": "img/work/Beauty/07.jpg" }
        ]
    },
    {
        "id": 5,
        "category": "festival",
        "categoryName": "Festival Posts",
        "title": "Vibrant Festival Creatives",
        "description": "Eye-catching designs for festive celebrations.",
        "client": "Multiple Brands",
        "date": "October 2023",
        "tools": "Photoshop, Illustrator, CorelDRAW",
        "coverImage": "img/work/Festive Section.jpg",
        "media": [
            { "type": "image", "src": "img/work/FestivePost/11.jpg" },
            { "type": "image", "src": "img/work/FestivePost/12.jpg" },
            { "type": "image", "src": "img/work/FestivePost/13.jpg" },
            { "type": "image", "src": "img/work/FestivePost/14.jpg" },
            { "type": "image", "src": "img/work/FestivePost/15.jpg" },
            { "type": "image", "src": "img/work/FestivePost/16.jpg" },
            { "type": "image", "src": "img/work/FestivePost/17.jpg" },
            { "type": "image", "src": "img/work/FestivePost/18.jpg" },
            { "type": "image", "src": "img/work/FestivePost/19.jpg" },
            { "type": "image", "src": "img/work/FestivePost/20.jpg" },
            { "type": "image", "src": "img/work/FestivePost/21.jpg" },
            { "type": "image", "src": "img/work/FestivePost/22.jpg" },
            { "type": "image", "src": "img/work/FestivePost/23.jpg" },
            { "type": "image", "src": "img/work/FestivePost/24.jpg" },
            { "type": "image", "src": "img/work/FestivePost/25.jpg" },
            { "type": "image", "src": "img/work/FestivePost/26.jpg" },
            { "type": "image", "src": "img/work/FestivePost/27.jpg" },
            { "type": "image", "src": "img/work/FestivePost/28.jpg" },
            { "type": "image", "src": "img/work/FestivePost/29.jpg" }
        ]
    },
    {
        "id": 6,
        "category": "bni",
        "categoryName": "BNI Work",
        "title": "BNI Work",
        "description": "Member promos, meeting creatives and referral cards for the BNI chapter.",
        "client": "BNI Chapter",
        "date": "2024",
        "tools": "Photoshop, Illustrator, Canva",
        "coverImage": "img/work/BNI/01.jpg",
        "media": [
            { "type": "image", "src": "img/work/BNI/01.jpg" },
            { "type": "image", "src": "img/work/BNI/02.jpg" },
            { "type": "image", "src": "img/work/BNI/03.jpg" },
            { "type": "image", "src": "img/work/BNI/04.jpg" },
            { "type": "image", "src": "img/work/BNI/05.jpg" },
            { "type": "image", "src": "img/work/BNI/06.jpg" },
            { "type": "image", "src": "img/work/BNI/07.jpg" },
            { "type": "image", "src": "img/work/BNI/08.jpg" },
            { "type": "image", "src": "img/work/BNI/09.jpg" },
            { "type": "image", "src": "img/work/BNI/10.jpg" },
            { "type": "image", "src": "img/work/BNI/11.jpg" }
        ]
    },
    {
        "id": 7,
        "category": "blog",
        "categoryName": "Blog Images",
        "title": "Blog Images",
        "description": "Cover images and article visuals for blog posts.",
        "client": "Multiple Blogs",
        "date": "2024",
        "tools": "Photoshop, Canva",
        "coverImage": "img/work/Blog/01.jpg",
        "media": [
            { "type": "image", "src": "img/work/Blog/01.jpg" },
            { "type": "image", "src": "img/work/Blog/02.jpg" },
            { "type": "image", "src": "img/work/Blog/03.jpg" },
            { "type": "image", "src": "img/work/Blog/04.jpg" }
        ]
    },
    {
        "id": 8,
        "category": "video",
        "categoryName": "Video",
        "title": "Video Edits",
        "description": "Short-form and promo video edits.",
        "client": "Multiple Clients",
        "date": "2024",
        "tools": "Premiere Pro, After Effects",
        "coverImage": "img/work/Social/17.jpg",
        "media": [
            { "type": "video", "src": "https://mdn.github.io/shared-assets/videos/flower.mp4", "poster": "img/work/Social/17.jpg", "demo": true },
            { "type": "video", "src": "https://mdn.github.io/shared-assets/videos/flower.webm", "poster": "img/work/FestivePost/11.jpg", "demo": true }
        ]
    },
    
    // {
    //     "id": 6,
    //     "category": "print",
    //     "categoryName": "Print Design",
    //     "title": "Marketing Brochures & Flyers",
    //     "description": "Engaging print materials that get picked up and read.",
    //     "client": "Local Businesses",
    //     "date": "August 2023",
    //     "tools": "InDesign, Photoshop, Illustrator",
    //     "hidden": true,
    //     "coverImage": "img/work/Print Section.jpg",
    //     "media": [
    //         { "type": "image", "src": "img/work/Print Section.jpg" }
    //     ]
    // }
];
