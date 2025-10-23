import { callGeminiAPI } from '../api.js';
import { showBalloon, hideBalloon, showToast, showModal, hideModal } from '../utils.js'; // Added showModal, hideModal

// --- DEMO DATA & STATE ---

const products = [
    // Add predictionScore to each product
    { id: 1, name: 'TrekWise Alpine Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 189.99, img: 'images/01.jpg', aiSuggestion: true, sku: 'TW-ALPB-U-9.5', cost: 95.50, materials: 'Leather, Gore-Tex, Rubber', sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12], colors: ['#5c4033', '#000000', '#808080'], predictionScore: 88,
        aiReasoning: {
            salesData: { score: 85, text: "Top 10% seller in F/W 2024." },
            eventImpact: { event: "Holiday Push", score: 70, text: "Strong performer during holiday sales." },
            trendData: { trend: "Gorpcore", score: 90, text: "High match for 'Gorpcore' utility trend." },
            colorData: { color: "Brown", score: 80, text: "Earthy tones are a key color trend." },
            weather: { forecast: "Cold/Wet", score: 95, text: "Excellent for predicted cold, wet weather." },
            economic: { indicator: "Premium", score: 60, text: "Matches premium durable goods spending." }
        }
    },
    { id: 2, name: 'Velocity Sprint Runner', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 145.50, img: 'images/02.jpg', aiSuggestion: true, sku: 'VL-SPRR-M-10', cost: 72.00, materials: 'Mesh, Synthetic, EVA', sizes: [9, 9.5, 10, 10.5, 11, 12, 13], colors: ['#0000ff', '#ffffff', '#ff0000'], predictionScore: 92,
        aiReasoning: {
            salesData: { score: 90, text: "Top 5% seller in S/S 2024." },
            eventImpact: { event: "Back to School", score: 85, text: "Strong 'Back to School' item." },
            trendData: { trend: "Retro Runners", score: 95, text: "Perfectly matches 'Retro Runners' trend." },
            colorData: { color: "Blue", score: 80, text: "Primary colors (blue) are in high demand." },
            weather: { forecast: "Mild/Dry", score: 70, text: "Best for mild, dry conditions." },
            economic: { indicator: "Mid-Range", score: 75, text: "Strong performer in mid-range price point." }
        }
    },
    { id: 3, name: 'Milano Weave Loafer', brand: 'Milano', style: 'Woven Leather', gender: 'Womens', price: 210.00, img: 'images/03.jpg', aiSuggestion: true, sku: 'ML-WVLF-W-7', cost: 110.00, materials: 'Woven Leather, Rubber Sole', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9], colors: ['#a0522d', '#000000'], predictionScore: 78,
        aiReasoning: {
            salesData: { score: 65, text: "Steady seller, low return rate." },
            eventImpact: { event: "Summer Season", score: 75, text: "High demand during summer vacation period." },
            trendData: { trend: "Quiet Luxury", score: 85, text: "Matches 'Quiet Luxury' and 'Woven' trends." },
            colorData: { color: "Brown", score: 70, text: "Classic color with perennial demand." },
            weather: { forecast: "Warm/Dry", score: 80, text: "High correlation with warm, dry weather." },
            economic: { indicator: "Luxury", score: 60, text: "Targets stable high-end consumer." }
        }
    },
    { id: 4, name: 'SunStep Espadrille', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Womens', price: 89.99, img: 'images/04.jpg', aiSuggestion: false, sku: 'SS-ESPA-W-8', cost: 45.00, materials: 'Canvas, Jute Rope', sizes: [6, 7, 8, 9, 10], colors: ['#f5f5dc', '#000000'], predictionScore: 55, aiReasoning: null },
    { id: 5, name: 'Velocity Charge XT', brand: 'Velocity', style: 'Retro Runners', gender: 'Womens', price: 155.00, img: 'images/05.jpg', aiSuggestion: false, sku: 'VL-CHGXT-W-7.5', cost: 78.00, materials: 'Suede, Mesh, Rubber', sizes: [6.5, 7, 7.5, 8, 8.5, 9], colors: ['#ffd700', '#000000'], predictionScore: 68, aiReasoning: null },
    { id: 6, name: 'TrekWise Glacier Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 220.00, img: 'images/06.jpg', aiSuggestion: false, sku: 'TW-GLCB-M-10', cost: 115.00, materials: 'Leather, Insulation, Rubber', sizes: [9, 9.5, 10, 10.5, 11, 12], colors: ['#4a4a4a', '#000000'], predictionScore: 72, aiReasoning: null },
    { id: 7, name: 'Milano Suede Driver', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 195.00, img: 'images/07.jpg', aiSuggestion: false, sku: 'ML-SDDR-M-9', cost: 105.00, materials: 'Suede, Rubber', sizes: [8, 8.5, 9, 9.5, 10, 11], colors: ['#000080', '#8B4513'], predictionScore: 65, aiReasoning: null },
    { id: 8, name: 'SunStep Beachcomber', brand: 'SunStep', style: 'Sandals', gender: 'Unisex', price: 65.50, img: 'images/08.jpg', aiSuggestion: false, sku: 'SS-BCH-U-9', cost: 32.00, materials: 'Canvas, EVA', sizes: [7, 8, 9, 10, 11, 12], colors: ['#3cb371', '#5f9ea0'], predictionScore: 48, aiReasoning: null },
    { id: 9, name: 'Velocity Pace Trainer', brand: 'Velocity', style: 'Retro Runners', gender: 'Unisex', price: 130.00, img: 'images/09.jpg', aiSuggestion: false, sku: 'VL-PCT-U-8.5', cost: 65.00, materials: 'Mesh, Synthetic', sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10], colors: ['#ffffff', '#0000ff'], predictionScore: 62, aiReasoning: null },
    { id: 10, name: 'TrekWise Summit Pro', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 250.00, img: 'images/10.jpg', aiSuggestion: false, sku: 'TW-SMPR-M-11', cost: 125.00, materials: 'Full-grain Leather, Vibram', sizes: [9, 10, 11, 12, 13], colors: ['#808080', '#00ff00'], predictionScore: 75, aiReasoning: null },
    { id: 11, name: 'Milano Classic Pump', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 180.00, img: 'images/11.jpg', aiSuggestion: false, sku: 'ML-CLSP-W-7', cost: 90.00, materials: 'Patent Leather', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9], colors: ['#ff0000', '#000000'], predictionScore: 58, aiReasoning: null },
    { id: 12, name: 'SunStep Boardwalk Flip', brand: 'SunStep', style: 'Sandals', gender: 'Mens', price: 45.00, img: 'images/12.jpg', aiSuggestion: false, sku: 'SS-BWFP-M-10', cost: 22.00, materials: 'Rubber, Nylon', sizes: [8, 9, 10, 11, 12, 13], colors: ['#cd853f', '#000000'], predictionScore: 45, aiReasoning: null },
    { id: 13, name: 'Velocity Echo Sneaker', brand: 'Velocity', style: 'Retro Runners', gender: 'Womens', price: 160.00, img: 'images/13.jpg', aiSuggestion: false, sku: 'VL-ECHO-W-8', cost: 80.00, materials: 'Suede, Mesh, Rubber', sizes: [6, 7, 8, 9, 10], colors: ['#ffff00', '#c0c0c0'], predictionScore: 70, aiReasoning: null },
    { id: 14, name: 'TrekWise Trail Runner', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Womens', price: 175.00, img: 'images/14.jpg', aiSuggestion: false, sku: 'TW-TRLR-W-7.5', cost: 88.00, materials: 'Synthetic, Mesh, Rubber', sizes: [6.5, 7, 7.5, 8, 8.5, 9], colors: ['#add8e6', '#808080'], predictionScore: 69, aiReasoning: null },
    { id: 15, name: 'Milano Tassel Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 225.00, img: 'images/15.jpg', aiSuggestion: false, sku: 'ML-TSLF-M-9.5', cost: 112.00, materials: 'Calfskin Leather', sizes: [8, 9, 9.5, 10, 11], colors: ['#000000', '#800000'], predictionScore: 66, aiReasoning: null },
    { id: 16, name: 'SunStep Reef Walker', brand: 'SunStep', style: 'Sandals', gender: 'Unisex', price: 75.00, img: 'images/16.jpg', aiSuggestion: false, sku: 'SS-RFWK-U-9', cost: 37.00, materials: 'Neoprene, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#008000', '#000000'], predictionScore: 52, aiReasoning: null },
    { id: 17, name: 'Velocity Apex High-Top', brand: 'Velocity', style: 'Retro Runners', gender: 'Unisex', price: 170.00, img: 'images/17.jpg', aiSuggestion: true, sku: 'VL-APXH-U-10', cost: 85.00, materials: 'Leather, Mesh, Rubber', sizes: [8, 9, 10, 11, 12], colors: ['#ffffff', '#0000ff'], predictionScore: 85,
        aiReasoning: {
            salesData: { score: 75, text: "Strong launch, 30% above forecast." },
            eventImpact: { event: "Back to School", score: 90, text: "High potential for 'Back to School' push." },
            trendData: { trend: "80s Basketball", score: 85, text: "High match for '80s Basketball' revival." },
            colorData: { color: "White/Blue", score: 80, text: "Classic colorway drives consistent demand." },
            weather: { forecast: "All-Season", score: 65, text: "Suitable for all seasons except heavy snow." },
            economic: { indicator: "Mid-Range", score: 70, text: "Hits the key $150-200 price point." }
        }
    },
    { id: 18, name: 'TrekWise Canyon Sandal', brand: 'TrekWise', style: 'Sandals', gender: 'Mens', price: 110.00, img: 'images/18.jpg', aiSuggestion: false, sku: 'TW-CYNS-M-11', cost: 55.00, materials: 'Webbing, Rubber', sizes: [9, 10, 11, 12, 13], colors: ['#f5deb3', '#a0522d'], predictionScore: 60, aiReasoning: null },
    { id: 19, name: 'Milano Ballet Flat', brand: 'Milano', style: 'Flats', gender: 'Womens', price: 165.00, img: 'images/19.jpg', aiSuggestion: false, sku: 'ML-BLTF-W-7', cost: 82.00, materials: 'Nappa Leather', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000', '#f5f5dc'], predictionScore: 63, aiReasoning: null },
    { id: 20, name: 'SunStep Cove Slipper', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Womens', price: 95.00, img: 'images/20.jpg', aiSuggestion: false, sku: 'SS-CVSL-W-8', cost: 47.00, materials: 'Canvas, Fleece Lining', sizes: [6, 7, 8, 9, 10], colors: ['#ffa500', '#d2b48c'], predictionScore: 50, aiReasoning: null },
    { id: 21, name: 'Velocity Volt Runner', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 150.00, img: 'images/21.jpg', aiSuggestion: false, sku: 'VL-VLTR-M-10.5', cost: 75.00, materials: 'Mesh, Synthetic', sizes: [9, 10, 10.5, 11, 12], colors: ['#000000', '#ffff00'], predictionScore: 67, aiReasoning: null },
    { id: 22, name: 'TrekWise Tundra Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 235.00, img: 'images/22.jpg', aiSuggestion: false, sku: 'TW-TNDB-U-9', cost: 118.00, materials: 'Leather, Waterproof Membrane', sizes: [8, 9, 10, 11], colors: ['#87ceeb', '#4682b4'], predictionScore: 73, aiReasoning: null },
    { id: 23, name: 'Milano Velvet Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Womens', price: 240.00, img: 'images/23.jpg', aiSuggestion: true, sku: 'ML-VLVL-W-7.5', cost: 120.00, materials: 'Velvet, Leather', sizes: [6, 7, 7.5, 8, 9], colors: ['#800080', '#000000'], predictionScore: 76,
        aiReasoning: {
            salesData: { score: 60, text: "Niche item, high margin, sells well in urban stores." },
            eventImpact: { event: "Holiday Parties", score: 85, text: "Perfect for holiday party season." },
            trendData: { trend: "Luxe Textures", score: 80, text: "Velvet aligns with 'Luxe Textures' trend." },
            colorData: { color: "Purple", score: 70, text: "Jewel tones are a key seasonal color." },
            weather: { forecast: "Cool/Dry", score: 50, text: "Best for indoor or clear weather events." },
            economic: { indicator: "Luxury", score: 70, text: "Targets high-end consumer, less price sensitive." }
        }
    },
    { id: 24, name: 'SunStep Laguna Slide', brand: 'SunStep', style: 'Sandals', gender: 'Womens', price: 70.00, img: 'images/24.jpg', aiSuggestion: false, sku: 'SS-LGNS-W-8', cost: 35.00, materials: 'Synthetic, Cork', sizes: [6, 7, 8, 9, 10], colors: ['#90ee90', '#f0e68c'], predictionScore: 49, aiReasoning: null },
    { id: 25, name: 'Aura Flex Trainer', brand: 'Aura', style: 'Performance', gender: 'Womens', price: 135.00, img: 'images/25.jpg', aiSuggestion: false, sku: 'AU-FLXT-W-8', cost: 67.00, materials: 'Knit, EVA', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#ffffff'], predictionScore: 64, aiReasoning: null },
    { id: 26, name: 'Apex Ascent Hiker', brand: 'Apex', style: 'Hiking Boots', gender: 'Mens', price: 195.00, img: 'images/26.jpg', aiSuggestion: false, sku: 'AP-ASCH-M-10', cost: 98.00, materials: 'Suede, Nylon, Rubber', sizes: [9, 10, 11, 12], colors: ['#00008b', '#ffa500'], predictionScore: 71, aiReasoning: null },
    { id: 27, name: 'Aura Stratus Runner', brand: 'Aura', style: 'Retro Runners', gender: 'Womens', price: 155.00, img: 'images/27.jpg', aiSuggestion: true, sku: 'AU-STRR-W-7', cost: 78.00, materials: 'Mesh, Suede', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#ffffff'], predictionScore: 82,
        aiReasoning: {
            salesData: { score: 80, text: "New model, 90% sell-through in test stores." },
            eventImpact: { event: "Spring Launch", score: 85, text: "Key item for Spring '25 lifestyle launch." },
            trendData: { trend: "Chunky Sole", score: 90, text: "Matches 'Chunky Sole' and 'Dad Sneaker' trends." },
            colorData: { color: "Pastels", score: 75, text: "Pastel pink is a high-growth color." },
            weather: { forecast: "Mild/Dry", score: 70, text: "Strong seasonal item for Spring/Summer." },
            economic: { indicator: "Mid-Range", score: 75, text: "Priced perfectly for target demographic." }
        }
    },
    { id: 28, name: 'Apex Urban Commuter', brand: 'Apex', style: 'Canvas Slip-On', gender: 'Unisex', price: 110.00, img: 'images/28.jpg', aiSuggestion: false, sku: 'AP-URBC-U-9', cost: 55.00, materials: 'Canvas, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#4682b4', '#ffffff'], predictionScore: 59, aiReasoning: null },
    { id: 29, name: 'TrekWise Ridgeback', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 210.00, img: 'images/29.jpg', aiSuggestion: false, sku: 'TW-RGBK-M-11', cost: 105.00, materials: 'Suede, Cordura', sizes: [9, 10, 11, 12], colors: ['#556b2f', '#000000'], predictionScore: 74, aiReasoning: null },
    { id: 30, name: 'Velocity Nova Trainer', brand: 'Velocity', style: 'Performance', gender: 'Womens', price: 140.00, img: 'images/30.jpg', aiSuggestion: false, sku: 'VL-NVTR-W-8.5', cost: 70.00, materials: 'Mesh, TPU', sizes: [6, 7, 8, 8.5, 9], colors: ['#add8e6', '#ffffff'], predictionScore: 66, aiReasoning: null },
    { id: 31, name: 'Milano Linen Espadrille', brand: 'Milano', style: 'Canvas Slip-On', gender: 'Womens', price: 185.00, img: 'images/31.jpg', aiSuggestion: false, sku: 'ML-LNSP-W-8', cost: 92.00, materials: 'Linen, Jute', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#f5f5dc'], predictionScore: 61, aiReasoning: null },
    { id: 32, name: 'SunStep Coastline Driver', brand: 'SunStep', style: 'Chunky Loafers', gender: 'Mens', price: 95.00, img: 'images/32.jpg', aiSuggestion: false, sku: 'SS-CSTD-M-10', cost: 48.00, materials: 'Leather, Rubber', sizes: [8, 9, 10, 11], colors: ['#d2b48c', '#a0522d'], predictionScore: 53, aiReasoning: null },
    { id: 33, name: 'Aura Bloom Flat', brand: 'Aura', style: 'Flats', gender: 'Womens', price: 120.00, img: 'images/33.jpg', aiSuggestion: false, sku: 'AU-BLMF-W-7', cost: 60.00, materials: 'Fabric, Leather', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#f5f5dc'], predictionScore: 60, aiReasoning: null },
    { id: 34, name: 'Apex Terrain Sandal', brand: 'Apex', style: 'Sandals', gender: 'Unisex', price: 130.00, img: 'images/34.jpg', aiSuggestion: false, sku: 'AP-TRNS-U-10', cost: 65.00, materials: 'Nylon, Rubber', sizes: [8, 9, 10, 11, 12], colors: ['#000080', '#808080'], predictionScore: 62, aiReasoning: null },
    { id: 35, name: 'TrekWise Sierra Low', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Womens', price: 165.00, img: 'images/35.jpg', aiSuggestion: false, sku: 'TW-SRLW-W-7.5', cost: 83.00, materials: 'Suede, Mesh', sizes: [6, 7, 7.5, 8, 9], colors: ['#008000', '#808080'], predictionScore: 68, aiReasoning: null },
    { id: 36, name: 'Velocity Comet Racer', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 160.00, img: 'images/36.jpg', aiSuggestion: false, sku: 'VL-CMTR-M-10', cost: 80.00, materials: 'Synthetic, Mesh', sizes: [9, 10, 11, 12], colors: ['#0000ff', '#c0c0c0'], predictionScore: 71, aiReasoning: null },
    { id: 37, name: 'Milano Stiletto Heel', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 250.00, img: 'images/37.jpg', aiSuggestion: false, sku: 'ML-STLH-W-7', cost: 125.00, materials: 'Leather', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000'], predictionScore: 57, aiReasoning: null },
    { id: 38, name: 'SunStep Pier Sandal', brand: 'SunStep', style: 'Sandals', gender: 'Womens', price: 80.00, img: 'images/38.jpg', aiSuggestion: false, sku: 'SS-PRSD-W-8', cost: 40.00, materials: 'Leatherette', sizes: [6, 7, 8, 9, 10], colors: ['#ffa500', '#f5deb3'], predictionScore: 54, aiReasoning: null },
    { id: 39, name: 'Aura Zenith Walker', brand: 'Aura', style: 'Performance', gender: 'Unisex', price: 145.00, img: 'images/39.jpg', aiSuggestion: false, sku: 'AU-ZNWK-U-9', cost: 72.00, materials: 'Knit, Foam', sizes: [7, 8, 9, 10, 11], colors: ['#ffc0cb', '#c0c0c0'], predictionScore: 67, aiReasoning: null },
    { id: 40, name: 'Apex Trailblazer', brand: 'Apex', style: 'Hiking Boots', gender: 'Unisex', price: 220.00, img: 'images/40.jpg', aiSuggestion: true, sku: 'AP-TRBZ-U-10', cost: 110.00, materials: 'Leather, Ballistic Nylon', sizes: [8, 9, 10, 11, 12], colors: ['#00008b', '#ffa500'], predictionScore: 79,
        aiReasoning: {
            salesData: { score: 70, text: "High durability, very low return rate (0.5%)." },
            eventImpact: { event: "Fall/Winter", score: 80, text: "Core item for Fall/Winter catalog." },
            trendData: { trend: "Workwear", score: 75, text: "Cross-sells with 'Workwear' utility trend." },
            colorData: { color: "Blue/Orange", score: 65, text: "Good visibility, popular with hikers." },
            weather: { forecast: "All-Weather", score: 90, text: "All-weather, waterproof design." },
            economic: { indicator: "Premium", score: 65, text: "Consumers paying more for durable goods." }
        }
    },
    { id: 41, name: 'Milano Horsebit Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 280.00, img: 'images/41.jpg', aiSuggestion: false, sku: 'ML-HBLF-M-9.5', cost: 140.00, materials: 'Leather', sizes: [8, 9, 9.5, 10, 11], colors: ['#8b0000', '#000000'], predictionScore: 69, aiReasoning: null },
    { id: 42, name: 'Velocity Phantom', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 175.00, img: 'images/42.jpg', aiSuggestion: false, sku: 'VL-PHTM-M-10', cost: 88.00, materials: 'Leather, Mesh', sizes: [9, 10, 11, 12], colors: ['#000080', '#c0c0c0'], predictionScore: 73, aiReasoning: null },
    { id: 43, name: 'TrekWise Vista Sandal', brand: 'TrekWise', style: 'Sandals', gender: 'Womens', price: 125.00, img: 'images/43.jpg', aiSuggestion: false, sku: 'TW-VSSD-W-8', cost: 62.00, materials: 'Webbing, EVA', sizes: [6, 7, 8, 9], colors: ['#556b2f', '#f5deb3'], predictionScore: 61, aiReasoning: null },
    { id: 44, name: 'SunStep Marina Slip-On', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Unisex', price: 75.00, img: 'images/44.jpg', aiSuggestion: false, sku: 'SS-MRNA-U-9', cost: 38.00, materials: 'Canvas, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#ffa500', '#ffffff'], predictionScore: 51, aiReasoning: null },
    { id: 45, name: 'Aura Solstice Runner', brand: 'Aura', style: 'Performance', gender: 'Womens', price: 160.00, img: 'images/45.jpg', aiSuggestion: false, sku: 'AU-SOLR-W-7.5', cost: 80.00, materials: 'Engineered Mesh', sizes: [6, 7, 7.5, 8, 9], colors: ['#ff69b4', '#ffffff'], predictionScore: 70, aiReasoning: null },
    { id: 46, name: 'Apex Stealth Boot', brand: 'Apex', style: 'Hiking Boots', gender: 'Mens', price: 240.00, img: 'images/46.jpg', aiSuggestion: false, sku: 'AP-STLB-M-11', cost: 120.00, materials: 'Synthetic, Waterproof', sizes: [9, 10, 11, 12, 13], colors: ['#4682b4', '#000000'], predictionScore: 76, aiReasoning: null },
    { id: 47, name: 'Milano Suede Pump', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 220.00, img: 'images/47.jpg', aiSuggestion: false, sku: 'ML-SDPM-W-7', cost: 110.00, materials: 'Suede', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000'], predictionScore: 59, aiReasoning: null },
    { id: 48, name: 'Velocity Core Trainer', brand: 'Velocity', style: 'Performance', gender: 'Unisex', price: 125.00, img: 'images/48.jpg', aiSuggestion: false, sku: 'VL-CRTR-U-9', cost: 63.00, materials: 'Mesh, Synthetic', sizes: [7, 8, 9, 10, 11], colors: ['#ffffff', '#0000ff'], predictionScore: 63, aiReasoning: null },
    { id: 49, name: 'SunStep Island Loafer', brand: 'SunStep', style: 'Woven Leather', gender: 'Mens', price: 115.00, img: 'images/49.jpg', aiSuggestion: false, sku: 'SS-ISLL-M-10', cost: 58.00, materials: 'Woven Leather', sizes: [8, 9, 10, 11], colors: ['#d2691e', '#a0522d'], predictionScore: 56, aiReasoning: null },
    { id: 50, name: 'Aura Harmony Flat', brand: 'Aura', style: 'Flats', gender: 'Womens', price: 130.00, img: 'images/50.jpg', aiSuggestion: true, sku: 'AU-HMNF-W-8', cost: 65.00, materials: 'Leather', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#000000'], predictionScore: 80,
        aiReasoning: {
            salesData: { score: 75, text: "High-volume, core 'basics' item." },
            eventImpact: { event: "Black Friday", score: 80, text: "Good 'door-crasher' or multi-buy item." },
            trendData: { trend: "Ballet Flat", score: 85, text: "Strong match for 'Ballet Flat' trend." },
            colorData: { color: "Pink", score: 70, text: "Pastels are selling well year-round." },
            weather: { forecast: "All-Season", score: 60, text: "Primarily an indoor/mild-weather shoe." },
            economic: { indicator: "Mid-Range", score: 80, text: "Accessible price point for high-velocity." }
        }
    },
    { id: 51, name: 'Apex Nomad Traveler', brand: 'Apex', style: 'Canvas Slip-On', gender: 'Mens', price: 105.00, img: 'images/51.jpg', aiSuggestion: false, sku: 'AP-NMD-M-10', cost: 53.00, materials: 'Canvas, Rubber', sizes: [8, 9, 10, 11], colors: ['#191970', '#ffffff'], predictionScore: 54, aiReasoning: null },
    { id: 52, name: 'TrekWise Peak Seeker', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 260.00, img: 'images/52.jpg', aiSuggestion: false, sku: 'TW-PKSK-U-10', cost: 130.00, materials: 'Leather, Gore-Tex', sizes: [8, 9, 10, 11, 12], colors: ['#008000', '#000000'], predictionScore: 77, aiReasoning: null }
];

// Mock Allocation Reasoning Data (will be generated dynamically)
const generateAllocationReasoning = (productId, storeId) => {
    // In a real app, this data would come from analysis
    const baseScore = Math.floor(Math.random() * 30) + 50; // Base score 50-80
    return {
        score: baseScore + Math.floor(Math.random() * 21) - 10, // Add some randomness
        inventory: Math.floor(Math.random() * 50),
        salesVelocity: (Math.random() * 5 + 1).toFixed(1), // Units per week
        reviews: (Math.random() * 1 + 4).toFixed(1), // Avg rating 4.0-5.0
        returnRate: (Math.random() * 10 + 2).toFixed(1) // % return rate 2-12%
    };
};


const stores = Array.from({ length: 100 }, (_, i) => {
    const city = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'][i % 8];
    return { id: `S${1001 + i}`, name: `${city} Store #${Math.floor(i / 8) + 1}`, city };
});

let purchasePlan = [];
let trendData = null;
let currentFilters = {
    brand: 'all',
    style: 'all',
    gender: 'all',
    aiSuggestion: false
};
let budget = {
    total: 1250000,
    lastSeason: 1180000, // Added last season's budget
    history: [950000, 1050000, 1100000, 1150000, 1180000], // Sample 5-year history (excluding current)
    spent: 0
};

// Sample data for new graphs
const economicIndicatorData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [{
        label: 'Consumer Spending Index',
        data: [105, 106, 108, 107, 109, 110],
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
    }]
};

const salesPredictionData = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
        label: 'Predicted Sales ($K)',
        data: [320, 380, 250, 280, 310, 340],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
};

const budgetHistoryData = {
    labels: ['2020', '2021', '2022', '2023', '2024'], // 5 years before current (2025)
    datasets: [{
        label: 'Budget History ($)',
        data: budget.history,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
    }]
};

// Sample Trend Detail Data (Top 5 items over last 6 months)
const trendDetailSampleData = {
    'Brand Momentum': { 'Velocity': [150, 160, 180, 170, 190, 210], 'TrekWise': [120, 130, 140, 135, 150, 160], 'Milano': [100, 105, 110, 115, 120, 125], 'Aura': [80, 85, 90, 95, 100, 110], 'Apex': [70, 75, 80, 85, 90, 95] },
    'Top Styles': { 'Retro Runners': [120, 220, 250, 240, 210, 100], 'Hiking Boots': [180, 190, 200, 195, 210, 200], 'Chunky Loafers': [150, 160, 110, 175, 190, 300], 'Performance': [130, 135, 160, 185, 150, 120], 'Canvas Slip-On': [100, 205, 310, 215, 120, 125] },
    'Color Palette': { 'Forest Green': [90, 195, 185, 200, 110, 120], 'Deep Blue': [80, 185, 190, 155, 100, 90], 'Cream': [70, 75, 80, 85, 90, 95], 'Burgundy': [60, 65, 70, 75, 80, 85], 'Black': [150, 110, 70, 85, 180, 200] },
    'Gender Focus': { 'Unisex': [300, 320, 350, 340, 370, 400], 'Womens': [250, 260, 280, 270, 290, 310], 'Mens': [280, 290, 310, 300, 320, 340] },
    'Price Point Sweet Spot': { '$150-$200': [400, 420, 450, 440, 470, 500], '$200-$250': [300, 310, 330, 320, 340, 360], '$100-$150': [350, 360, 380, 370, 390, 410], '$50-$100': [200, 210, 220, 215, 230, 240], '$250+': [150, 160, 170, 165, 180, 190] },
};
const trendDetailMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']; // Labels for trend detail graph

// Chart instances - store globally to prevent duplicates if re-rendering
let budgetHistoryChartInstance = null;
let economicIndicatorChartInstance = null;
let salesPredictionChartInstance = null;
let trendDetailChartInstance = null; // For the modal

async function render(container) {
    container.innerHTML = `<div class="flex justify-center items-center h-full"><div class="spinner"></div><span class="ml-4">Loading Assortment Planner...</span></div>`;

    try {
        const rawTrendData = await callGeminiAPI('GET_ASSORTMENT_TRENDS');
        const cleanedTrendData = rawTrendData.replace(/```json\n?|```/g, '');
        trendData = JSON.parse(cleanedTrendData);
    } catch (e) {
        console.error("Failed to parse trend data:", e, "Raw data:", rawTrendData);
        container.innerHTML = `<p class="text-red-500">Error loading trend data. Please try again.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="space-y-8 assortment-planner">
            <section id="trend-dashboard">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">AI Seasonal Trend Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4"> 
                    ${renderTrendInfographics()}
                </div>
            </section>

             <section id="budget-dashboard" class="bg-white p-4 rounded-lg shadow-md">
                ${renderBudgetSection()}
            </section>

            <section id="product-catalog">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Product Catalog</h2>
                    ${renderFilters()}
                </div>
                <div id="product-list" class="product-grid-view">
                    ${filterAndRenderProducts()}
                </div>
            </section>

            <section id="purchase-plan-allocation">
                <div id="purchase-plan-header">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">Purchase Plan & Store Allocation</h2>
                        <button id="accept-ai-suggestions-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled>✨ Accept AI Suggestions</button>
                    </div>
                </div>
                <div id="allocation-table-container">
                    ${renderAllocationTable()}
                </div>
                <div class="mt-6 flex justify-start items-center space-x-3">
                    <button id="save-plan-btn" class="text-sm bg-gray-600 text-white py-2 px-5 rounded-lg hover:bg-gray-700">
                       Save
                    </button>
                    <button id="submit-plan-btn" class="text-sm bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700">
                       Submit and Send
                    </button>
                    <button id="export-excel-btn" class="flex items-center space-x-2 text-sm bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       <span>Export to Excel</span>
                    </button>
                </div>
            </section>
        </div>
    `;

    addEventListeners();
    animateInfographics();
    updateBudgetDisplay();
    updateStoreTotals();
    updateProductTotals(); // Add call here
    initializeCharts(); // Initialize all charts
}

// --- RENDERING FUNCTIONS ---

function renderTrendInfographics() {
    if (!trendData) return '<p>Trend data not available.</p>';
    const renderChart = (title, data, color) => `
        <div class="trend-infographic bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-gray-600">${title}</h3>
                <button class="text-xs text-blue-500 hover:underline see-more-trends-btn" data-category="${title}">More</button>
            </div>
            <div class="space-y-2">
            ${data.sort((a,b) => b.trendPercentage - a.trendPercentage).slice(0, 3).map(item => `
                <div class="text-sm">
                    <div class="flex justify-between font-medium">
                        <span>${item.name}</span>
                        <span class="text-${color}-600">+${item.trendPercentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5"><div class="bg-${color}-500 h-1.5 rounded-full" style="width: 0%" data-width="${item.trendPercentage * 1.5 > 100 ? 100 : item.trendPercentage * 1.5}%"></div></div>
                </div>
            `).join('')}
            </div>
        </div>
    `;
    return `
        ${renderChart('Brand Momentum', trendData.brands, 'blue')}
        ${renderChart('Top Styles', trendData.styles, 'green')}
        ${renderChart('Color Palette', trendData.colors, 'purple')}
        ${renderChart('Gender Focus', trendData.genders, 'pink')}
        ${renderChart('Price Point Sweet Spot', trendData.pricePoints, 'yellow')}
        <div class="trend-infographic bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-semibold text-gray-600 mb-2">Seasonal Forecast</h3>
            <div class="text-center">
                 <svg class="w-16 h-16 text-yellow-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <p class="font-bold mt-2">Warm & Dry</p>
                <p class="text-xs text-gray-500">Focus on breathable materials.</p>
            </div>
        </div>
         <div class="trend-infographic bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-semibold text-gray-600 mb-2">Economic Indicator</h3>
            <div class="h-[100px]"><canvas id="economicIndicatorChart"></canvas></div>
        </div>
        <div class="trend-infographic bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-semibold text-gray-600 mb-2">Sales Prediction (Next 6M)</h3>
             <div class="h-[100px]"><canvas id="salesPredictionChart"></canvas></div>
        </div>
    `;
}

function renderBudgetSection() {
    return `
        <div class="flex flex-wrap items-center justify-between gap-4">
            <h3 class="text-xl font-bold text-gray-800">Seasonal Budget</h3>
            <button id="request-budget-increase-btn" class="text-sm bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600">Request Budget Increase</button>
        </div>
        <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div id="budget-bottom-row" class="bg-gray-50 p-3 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Budget History (5 Years)</h4>
                <div id="budget-history-graph-container" class="h-[100px] lg:h-[180px]" style="width: 50%;">
                    <canvas id="budgetHistoryChart"></canvas>
                </div>
            </div>
            <div class="lg:col-span-2 space-y-4">
                 <div id="budget-kpi-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div class="text-sm text-gray-500">Total Budget</div>
                        <div id="budget-total" class="text-2xl font-bold text-gray-800">$${budget.total.toLocaleString()}</div>
                    </div>
                     <div>
                        <div class="text-sm text-gray-500">Last Season</div>
                        <div id="budget-last-season" class="text-xl font-medium text-gray-600">$${budget.lastSeason.toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Plan Cost</div>
                        <div id="budget-plan-cost" class="text-2xl font-bold text-blue-600">$0</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Remaining</div>
                        <div id="budget-remaining" class="text-2xl font-bold text-green-600">$${budget.total.toLocaleString()}</div>
                    </div>
                </div>
                <div id="budget-progress-container" class="w-full bg-gray-200 rounded-full h-4">
                    <div id="budget-progress-bar" class="bg-blue-600 h-4 rounded-full" style="width: 0%"></div>
                </div>
            </div>
        </div>
    `;
}


function renderFilters() {
    const brands = [...new Set(products.map(p => p.brand))];
    const styles = [...new Set(products.map(p => p.style))];
    const genders = [...new Set(products.map(p => p.gender))];

    return `
        <div id="catalog-filters" class="flex flex-wrap items-center gap-4">
            <select data-filter="brand" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Brands</option>
                ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
            </select>
            <select data-filter="style" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Styles</option>
                ${styles.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select data-filter="gender" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Genders</option>
                ${genders.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
            <label class="flex items-center text-sm cursor-pointer">
                <input type="checkbox" data-filter="aiSuggestion" class="filter-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="ml-2 text-gray-700">AI Suggestions Only</span>
            </label>
        </div>
    `;
}

function filterAndRenderProducts() {
    const filtered = products.filter(p => {
        return (currentFilters.brand === 'all' || p.brand === currentFilters.brand) &&
               (currentFilters.style === 'all' || p.style === currentFilters.style) &&
               (currentFilters.gender === 'all' || p.gender === currentFilters.gender) &&
               (!currentFilters.aiSuggestion || p.aiSuggestion);
    });
    return filtered.map(p => renderProductGridItem(p)).join('');
}

function renderProductGridItem(product) {
    const isAdded = purchasePlan.some(p => p.id === product.id);
    const aiIconSVG = `<div class="ai-suggestion-icon-wrapper">
        <svg class="ai-suggestion-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V4.75C12.75 5.16 12.41 5.5 12 5.5C11.59 5.5 11.25 5.16 11.25 4.75V3.25C11.25 2.84 11.59 2.5 12 2.5Z" fill="currentColor"/><path d="M18.04 5.96C18.33 5.67 18.8 5.67 19.09 5.96C19.38 6.25 19.38 6.72 19.09 7.01L17.99 8.11C17.7 8.4 17.23 8.4 16.94 8.11C16.65 7.82 16.65 7.35 16.94 7.06L18.04 5.96Z" fill="currentColor"/><path d="M5.96 5.96C6.25 5.67 6.72 5.67 7.01 5.96L8.11 7.06C8.4 7.35 8.4 7.82 8.11 8.11C7.82 8.4 7.35 8.4 7.06 8.11L5.96 7.01C5.67 6.72 5.67 6.25 5.96 5.96Z" fill="currentColor"/><path d="M21.5 12C21.5 11.59 21.16 11.25 20.75 11.25L19.25 11.25C18.84 11.25 18.5 11.59 18.5 12C18.5 12.41 18.84 12.75 19.25 12.75L20.75 12.75C21.16 12.75 21.5 12.41 21.5 12Z" fill="currentColor"/><path d="M4.75 11.25C5.16 11.25 5.5 11.59 5.5 12C5.5 12.41 5.16 12.75 4.75 12.75L3.25 12.75C2.84 12.75 2.5 12.41 2.5 12C2.5 11.59 2.84 11.25 3.25 11.25L4.75 11.25Z" fill="currentColor"/><path d="M12 10.5C14.49 10.5 16.5 12.51 16.5 15V17.5C16.5 18.05 16.05 18.5 15.5 18.5H8.5C7.95 18.5 7.5 18.05 7.5 17.5V15C7.5 12.51 9.51 10.5 12 10.5ZM12 9C8.69 9 6 11.69 6 15V17.5C6 18.88 7.12 20 8.5 20H15.5C16.88 20 18 18.88 18 17.5V15C18 11.69 15.31 9 12 9Z" fill="currentColor"/>
        </svg>
    </div>`;

    let scoreColorClass = 'text-gray-500';
    if (product.predictionScore >= 80) scoreColorClass = 'text-green-600 font-semibold';
    else if (product.predictionScore >= 60) scoreColorClass = 'text-blue-600';
    else if (product.predictionScore < 50) scoreColorClass = 'text-red-600';

    return `
        <div class="product-grid-item" data-product-id="${product.id}">
            <div class="product-card-content">
                <div class="product-main-view">
                    <div class="product-thumbnail">
                        <img src="${product.img}" alt="${product.name}">
                    </div>
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <div class="specs">${product.brand}</div>
                        <div class="product-actions">
                            <span class="price">$${product.price.toFixed(2)}</span>
                            ${product.aiSuggestion ? aiIconSVG : ''}
                        </div>
                    </div>
                    <button class="add-to-plan-btn ${isAdded ? 'added' : ''}">
                        ${isAdded ? '✓ Remove' : '+ Add'}
                    </button>
                </div>
                <div class="product-expanded-details">
                    <div class="expanded-info">
                        <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                        <p><strong>Cost:</strong> $${product.cost ? product.cost.toFixed(2) : 'N/A'}</p>
                        <p><strong>Materials:</strong> ${product.materials || 'N/A'}</p>
                        <p class="ai-prediction-score">
                            <strong>AI Score:</strong> <span class="${scoreColorClass}">${product.predictionScore}/100</span>
                        </p>
                    </div>
                    <div class="expanded-options">
                         <div class="sizes">
                            <strong>Sizes:</strong>
                            <div class="size-options">
                                ${product.sizes ? product.sizes.map(s => `<span>${s}</span>`).join('') : 'Not Available'}
                            </div>
                        </div>
                        <div class="colors">
                            <strong>Colors:</strong>
                            <div class="color-options">
                                ${product.colors ? product.colors.map(c => `<span class="color-swatch" style="background-color:${c};"></span>`).join('') : 'Not Available'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAllocationTable() {
    if (purchasePlan.length === 0) {
        return `<p class="text-center text-gray-500 py-8">Add products from the catalog to begin planning.</p>`;
    }
    const header = purchasePlan.map(p => `<th class="sticky top-0 z-10 px-2 py-3 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">${p.name}</th>`).join('');
    const rows = stores.map(store => `
        <tr class="hover:bg-gray-50 store-row" data-store-id="${store.id}">
            <td class="sticky left-0 bg-white hover:bg-gray-50 px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">${store.name}</td>
            ${purchasePlan.map(p => {
                 const reasoningData = generateAllocationReasoning(p.id, store.id);
                 const suggestedQty = Math.floor(reasoningData.score / 5);
                 return `
                    <td class="p-1 text-center">
                        <div class="allocation-cell">
                             <span class="ai-quantity-suggestion"
                                   data-reasoning='${JSON.stringify(reasoningData)}'>
                                AI: ${suggestedQty}
                             </span>
                            <input type="number" class="w-20 text-center border rounded-md p-1 allocation-input" placeholder="0" data-store-id="${store.id}" data-product-id="${p.id}" data-cost="${p.cost}">
                        </div>
                    </td>
                 `;
            }).join('')}
             <td class="sticky right-0 bg-white hover:bg-gray-50 px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-800 text-center store-total">0</td>
        </tr>
    `).join('');

    // Footer row for product totals
    const footerCells = purchasePlan.map(p => `
        <td class="px-2 py-2 text-center text-sm font-bold product-total-cell" data-product-id="${p.id}">0</td>
    `).join('');

    return `
        <div class="overflow-auto max-h-[600px] border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="sticky left-0 top-0 z-20 px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Store</th>
                        ${header}
                         <th class="sticky right-0 top-0 z-20 px-4 py-3 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Store Total</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
                <tfoot class="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                        <td class="sticky left-0 bg-gray-100 px-4 py-2 text-sm font-bold text-gray-800">Total Units</td>
                        ${footerCells}
                        <td class="sticky right-0 bg-gray-100 px-4 py-2 text-center text-sm font-bold text-gray-800" id="grand-total-cell">0</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// --- CHART INITIALIZATION ---
function initializeCharts() {
    // Destroy previous instances if they exist
    if (budgetHistoryChartInstance) budgetHistoryChartInstance.destroy();
    if (economicIndicatorChartInstance) economicIndicatorChartInstance.destroy();
    if (salesPredictionChartInstance) salesPredictionChartInstance.destroy();

    // Budget History Chart
    const budgetCtx = document.getElementById('budgetHistoryChart')?.getContext('2d');
    if (budgetCtx) {
        budgetHistoryChartInstance = new Chart(budgetCtx, {
            type: 'bar',
            data: budgetHistoryData,
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: value => '$' + value / 1000 + 'K' } } } }
        });
    }

    // Economic Indicator Chart
    const economicCtx = document.getElementById('economicIndicatorChart')?.getContext('2d');
    if (economicCtx) {
        economicIndicatorChartInstance = new Chart(economicCtx, {
            type: 'line',
            data: economicIndicatorData,
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
        });
    }

    // Sales Prediction Chart
    const salesCtx = document.getElementById('salesPredictionChart')?.getContext('2d');
    if (salesCtx) {
        salesPredictionChartInstance = new Chart(salesCtx, {
            type: 'bar',
            data: salesPredictionData,
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }
}


// --- CALCULATION & UPDATE FUNCTIONS ---
function calculatePlanCost() {
    const allocationTable = document.getElementById('allocation-table-container');
    if (!allocationTable) return 0;

    const inputs = allocationTable.querySelectorAll('.allocation-input');
    let totalCost = 0;
    inputs.forEach(input => {
        const quantity = parseInt(input.value, 10) || 0;
        const cost = parseFloat(input.dataset.cost) || 0;
        totalCost += quantity * cost;
    });
    return totalCost;
}

function updateBudgetDisplay() {
    const planCost = calculatePlanCost();
    const remaining = budget.total - planCost;
    const percentage = budget.total > 0 ? (planCost / budget.total) * 100 : 0;

    const budgetPlanCostEl = document.getElementById('budget-plan-cost');
    const budgetRemainingEl = document.getElementById('budget-remaining');
    const budgetProgressBarEl = document.getElementById('budget-progress-bar');
    const budgetLastSeasonEl = document.getElementById('budget-last-season'); // Get the new element

    if (budgetPlanCostEl) budgetPlanCostEl.textContent = `$${planCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (budgetRemainingEl) budgetRemainingEl.textContent = `$${remaining.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (budgetProgressBarEl) budgetProgressBarEl.style.width = `${Math.min(100, percentage)}%`; // Cap at 100%
    if (budgetLastSeasonEl) budgetLastSeasonEl.textContent = `$${budget.lastSeason.toLocaleString()}`; // Update last season display


    if (budgetRemainingEl) {
        if (remaining < 0) {
            budgetRemainingEl.classList.remove('text-green-600');
            budgetRemainingEl.classList.add('text-red-600');
        } else {
            budgetRemainingEl.classList.add('text-green-600');
            budgetRemainingEl.classList.remove('text-red-600');
        }
    }
}

function updateStoreTotals() {
    const tableContainer = document.getElementById('allocation-table-container');
    if (!tableContainer) return;
    const rows = tableContainer.querySelectorAll('.store-row');
    rows.forEach(row => {
        const inputs = row.querySelectorAll('.allocation-input');
        let rowTotal = 0;
        inputs.forEach(input => {
            rowTotal += parseInt(input.value, 10) || 0;
        });
        const totalCell = row.querySelector('.store-total');
        if (totalCell) {
            totalCell.textContent = rowTotal;
        }
    });
}

// --- New Function to Update Product Totals ---
function updateProductTotals() {
    const tableContainer = document.getElementById('allocation-table-container');
    if (!tableContainer) return;

    let grandTotal = 0;
    purchasePlan.forEach(product => {
        const inputs = tableContainer.querySelectorAll(`.allocation-input[data-product-id="${product.id}"]`);
        let productTotal = 0;
        inputs.forEach(input => {
            productTotal += parseInt(input.value, 10) || 0;
        });

        const totalCell = tableContainer.querySelector(`tfoot .product-total-cell[data-product-id="${product.id}"]`);
        if (totalCell) {
            totalCell.textContent = productTotal;
        }
        grandTotal += productTotal;
    });

    // Update Grand Total Cell
    const grandTotalCell = document.getElementById('grand-total-cell');
    if (grandTotalCell) {
        grandTotalCell.textContent = grandTotal;
    }
}


function updateAcceptAISuggestionsButtonState() {
    const acceptBtn = document.getElementById('accept-ai-suggestions-btn');
    if (acceptBtn) {
        acceptBtn.disabled = purchasePlan.length === 0;
    }
}


// --- EVENT LISTENERS & HANDLERS ---

function addEventListeners() {
    const moduleContainer = document.querySelector('.assortment-planner');
    if (!moduleContainer) return;

    // --- Click Listeners ---
    moduleContainer.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-plan-btn');
        const acceptSugBtn = e.target.closest('#accept-ai-suggestions-btn');
        const exportBtn = e.target.closest('#export-excel-btn');
        const seeMoreBtn = e.target.closest('.see-more-trends-btn');
        const productItem = e.target.closest('.product-grid-item');
        const budgetReqBtn = e.target.closest('#request-budget-increase-btn');
        const saveBtn = e.target.closest('#save-plan-btn'); // Added this
        const submitBtn = e.target.closest('#submit-plan-btn'); // Added this
        const isActionableClick = e.target.closest('.add-to-plan-btn, .ai-suggestion-icon-wrapper, .ai-quantity-suggestion, a, button, canvas'); // Added canvas

        if (addBtn) {
            handleProductListClick(addBtn);
        } else if (acceptSugBtn) {
            handleAcceptAISuggestionsClick();
        } else if (exportBtn) {
            handleExportExcelClick();
        } else if (seeMoreBtn) {
            handleSeeMoreTrendsClick(seeMoreBtn); // Updated handler
        } else if (budgetReqBtn) {
            showToast('Budget increase request sent to management for approval.');
        } else if (saveBtn) { // Added this block
            showToast('Purchase plan saved.');
        } else if (submitBtn) { // Added this block
            showToast('Purchase plan submitted and sent for approval.');
        } else if (productItem && !isActionableClick) {
            handleProductExpand(productItem);
        } else {
            const balloon = document.getElementById('ai-balloon-container');
            if (balloon && !balloon.contains(e.target) && !e.target.closest('.ai-suggestion-icon-wrapper, .ai-quantity-suggestion')) {
                 hideBalloon();
            }
        }
    });

    // --- Hover Listeners ---
     moduleContainer.addEventListener('mouseover', (e) => {
        const productAiIcon = e.target.closest('.ai-suggestion-icon-wrapper');
        const allocationAiIcon = e.target.closest('.ai-quantity-suggestion');

        if (productAiIcon) {
            handleAISuggestionHover(productAiIcon);
        } else if (allocationAiIcon) {
             handleAllocationSuggestionHover(allocationAiIcon);
        }
    });

    moduleContainer.addEventListener('mouseout', (e) => {
        const productAiIcon = e.target.closest('.ai-suggestion-icon-wrapper');
        const allocationAiIcon = e.target.closest('.ai-quantity-suggestion');

        if (productAiIcon || allocationAiIcon) {
            const balloon = document.getElementById('ai-balloon-container');
            if (!balloon || !balloon.contains(e.relatedTarget)) {
                hideBalloon();
            }
        }
    });


    // --- Input Listener ---
     moduleContainer.addEventListener('input', (e) => {
        if (e.target.matches('.allocation-input')) {
            updateBudgetDisplay();
            updateStoreTotals();
            updateProductTotals(); // Add call here
        }
    });

    // --- Change Listener ---
    moduleContainer.addEventListener('change', handleFilterChange);
}


// --- HANDLER FUNCTIONS ---
function handleFilterChange(e) {
    const target = e.target;
    if (target.matches('.filter-select') || target.matches('.filter-checkbox')) {
        const filterType = target.dataset.filter;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        currentFilters[filterType] = value;
        document.getElementById('product-list').innerHTML = filterAndRenderProducts();
    }
}

function handleProductListClick(button) {
    const itemElement = button.closest('.product-grid-item');
    const productId = parseInt(itemElement.dataset.productId, 10);
    const productIndex = purchasePlan.findIndex(p => p.id === productId);

    if (productIndex > -1) {
        purchasePlan.splice(productIndex, 1);
        button.textContent = '+ Add';
        button.classList.remove('added');
        showToast('Product removed from plan.');
    } else {
        const product = products.find(p => p.id === productId);
        if (product) {
            purchasePlan.push(product);
            button.textContent = '✓ Remove';
            button.classList.add('added');
            showToast(`${product.name} added to plan.`);
        }
    }
    // Re-render table and update totals
    document.getElementById('allocation-table-container').innerHTML = renderAllocationTable();
    updateAcceptAISuggestionsButtonState();
    updateBudgetDisplay();
    updateStoreTotals();
    updateProductTotals(); // Add call here
}

function handleProductExpand(clickedItem) {
    const currentlyExpanded = document.querySelector('.product-grid-item.expanded');
    if (currentlyExpanded && currentlyExpanded !== clickedItem) {
        currentlyExpanded.classList.remove('expanded');
    }
    clickedItem.classList.toggle('expanded');
}

function handleAcceptAISuggestionsClick() {
    const allocationTable = document.getElementById('allocation-table-container');
    if (!allocationTable) return;

    const inputs = allocationTable.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        const cell = input.closest('.allocation-cell');
        const suggestionSpan = cell.querySelector('.ai-quantity-suggestion');
        if (suggestionSpan) {
            const suggestionText = suggestionSpan.textContent;
            const suggestedValue = suggestionText.split(':')[1].trim();
            if (suggestedValue && !isNaN(suggestedValue)) {
                input.value = suggestedValue;
            }
        }
    });
    showToast('All AI suggestions have been applied.');
    updateBudgetDisplay();
    updateStoreTotals();
    updateProductTotals(); // Add call here
}

function handleExportExcelClick() {
    if (purchasePlan.length === 0) {
        showToast('Your purchase plan is empty.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    const allocationTable = document.getElementById('allocation-table-container');
    const headers = ['Store', ...purchasePlan.map(p => `"${p.name}"`), 'Store Total'];
    csvContent += headers.join(',') + '\r\n';

    const inputs = Array.from(allocationTable.querySelectorAll('input[type="number"]'));

    stores.forEach(store => { // Export all stores, not just first 10
        const row = [`"${store.name}"`];
        let rowTotal = 0;
        purchasePlan.forEach(product => {
            const input = inputs.find(i => i.dataset.storeId === store.id && i.dataset.productId == product.id);
            const value = input && input.value ? parseInt(input.value, 10) : 0;
            row.push(value);
            rowTotal += value;
        });
        row.push(rowTotal);
        csvContent += row.join(',') + '\r\n';
    });

    // Add Product Totals Row
    const productTotalsRow = ['"Total Units"'];
    let grandTotal = 0;
    purchasePlan.forEach(product => {
        const productTotalCell = allocationTable.querySelector(`tfoot .product-total-cell[data-product-id="${product.id}"]`);
        const total = productTotalCell ? parseInt(productTotalCell.textContent, 10) : 0;
        productTotalsRow.push(total);
        grandTotal += total;
    });
    productTotalsRow.push(grandTotal); // Add grand total at the end
    csvContent += productTotalsRow.join(',') + '\r\n';


    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "purchase_plan_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Purchase plan has been exported.');
}

// --- New handler for 'More' trend button ---
function handleSeeMoreTrendsClick(button) {
    const category = button.dataset.category;
    const categoryData = trendDetailSampleData[category];
    if (!categoryData) {
        showToast(`Detailed trend data for ${category} is not available.`);
        return;
    }

    const modalContent = `
        <div class="trend-detail-popup">
             <p class="text-sm text-gray-600 mb-3">Showing top 5 for last 6 months.</p>
             <div class="h-[300px]"><canvas id="trendDetailChart"></canvas></div>
        </div>
    `;
    showModal(`Trend Details: ${category}`, modalContent, true); // Use large modal

    // Render chart in the modal AFTER it's shown
    setTimeout(() => {
        const ctx = document.getElementById('trendDetailChart')?.getContext('2d');
        if (ctx) {
            // Destroy previous instance if exists
            if (trendDetailChartInstance) trendDetailChartInstance.destroy();

            // Prepare Chart.js data
            const datasets = Object.entries(categoryData).map(([label, data], index) => ({
                label: label,
                data: data,
                // Assign distinct colors - basic example
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
                tension: 0.1,
                fill: false
            }));

            trendDetailChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trendDetailMonths,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    scales: {
                         y: { beginAtZero: true }
                    }
                }
            });
        } else {
             console.error("Canvas context for trend detail chart not found in modal.");
        }
    }, 100); // Small delay to ensure modal DOM is ready
}


// --- AI REASONING HOVER FUNCTIONS ---
function renderReasoningCard(product) {
    if (!product.aiReasoning) {
        return `<div class="reasoning-card"><p class="p-4">No AI analysis available for this product.</p></div>`;
    }
    const r = product.aiReasoning;
    const factors = [
        { title: 'Prev. Sales', data: r.salesData, icon: '📈' },
        { title: 'Event Impact', data: r.eventImpact, icon: '🎉' },
        { title: 'Style Trend', data: r.trendData, icon: '🔥' },
        { title: 'Color Trend', data: r.colorData, icon: '🎨' },
        { title: 'Weather', data: r.weather, icon: '☀️' },
        { title: 'Economic', data: r.economic, icon: '💰' }
    ];

    let factorsHtml = factors.map(f => {
        if (!f.data) return '';
        let barColorClass = 'bg-blue-500';
        if (f.data.score >= 80) barColorClass = 'bg-green-500';
        else if (f.data.score < 60) barColorClass = 'bg-yellow-500';

        return `
        <div class="reasoning-factor">
            <div class="factor-icon">${f.icon}</div>
            <div class="factor-details">
                <div class="factor-title">${f.title} (Score: ${f.data.score})</div>
                <div class="factor-chart-bar-container">
                    <div class="factor-chart-bar ${barColorClass}" style="width: ${f.data.score}%;"></div>
                </div>
                <div class="factor-text">${f.data.text}</div>
            </div>
        </div>
        `;
    }).join('');

    return `
    <div class="reasoning-card">
        <h4 class="reasoning-card-title">${product.name}</h4>
        <p class="reasoning-card-subtitle">AI Recommendation Rationale:</p>
        <div class="reasoning-factors-grid">
            ${factorsHtml}
        </div>
    </div>
    `;
}

function renderAllocationReasoning(reasoningData) {
    let scoreColorClass = 'text-gray-600';
    if (reasoningData.score >= 80) scoreColorClass = 'text-green-600';
    else if (reasoningData.score < 60) scoreColorClass = 'text-yellow-700';

    return `
    <div class="allocation-reasoning-popup">
        <h5 class="font-semibold text-xs mb-1">Allocation Rationale (<span class="${scoreColorClass}">${reasoningData.score}/100</span>)</h5>
        <ul class="space-y-1 text-xs text-gray-700">
            <li><span class="font-medium">Inventory:</span> ${reasoningData.inventory} units</li>
            <li><span class="font-medium">Sales Rec:</span> ${reasoningData.salesVelocity} units</li>
            <li><span class="font-medium">Reviews:</span> ${reasoningData.reviews} ★</li>
            <li><span class="font-medium">Return Rate:</span> ${reasoningData.returnRate}%</li>
        </ul>
    </div>
    `;
}

function handleAISuggestionHover(iconWrapper) {
    if (iconWrapper.classList.contains('is-showing-balloon')) return;
    hideBalloon();
    iconWrapper.classList.add('is-showing-balloon');

    const itemElement = iconWrapper.closest('.product-grid-item');
    const productId = parseInt(itemElement.dataset.productId, 10);
    const product = products.find(p => p.id === productId);
    const rect = iconWrapper.getBoundingClientRect();

    if (!product) {
        showBalloon('<div class="p-2">Error: Product not found.</div>', rect);
        return;
    }

    const content = renderReasoningCard(product);
    showBalloon(content, rect);

    const balloon = document.getElementById('ai-balloon-container');
    if (balloon) {
        balloon.onmouseenter = () => { if (balloon.hideTimeout) clearTimeout(balloon.hideTimeout); };
        balloon.onmouseleave = hideBalloon;
    }
}

function handleAllocationSuggestionHover(spanElement) {
    if (spanElement.classList.contains('is-showing-balloon')) return;
    hideBalloon();
    spanElement.classList.add('is-showing-balloon');

    const reasoningData = JSON.parse(spanElement.dataset.reasoning || '{}');
    const rect = spanElement.getBoundingClientRect();
    const content = renderAllocationReasoning(reasoningData);
    showBalloon(content, rect);

    const balloon = document.getElementById('ai-balloon-container');
    if (balloon) {
        balloon.onmouseenter = () => { if (balloon.hideTimeout) clearTimeout(balloon.hideTimeout); };
        balloon.onmouseleave = hideBalloon;
    }
}


// --- HELPERS ---

function animateInfographics() {
    document.querySelectorAll('[data-width]').forEach(bar => {
        // Ensure animation runs even if element is already in view
        bar.style.width = '0%'; // Reset first
        setTimeout(() => { bar.style.width = bar.dataset.width; }, 50); // Short delay
    });
}


export { render as init };

