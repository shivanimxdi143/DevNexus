// Realistic human profile portrait gallery for DevNexus
// High-resolution, professional, diverse portraits of real developers
const CURATED_DEVELOPER_PORTRAITS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80", // Female developer
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80", // Male developer
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80", // Female developer
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80", // Male developer
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80", // Female engineer
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80", // Male founder
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80", // Female tech lead
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=80", // Male fullstack
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80", // Female developer
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80", // Male backend
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80", // Male creative dev
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80", // Female designer
];

/**
 * Deterministically pick a realistic portrait based on a unique identifier
 */
function getDeterministicPortrait(seed) {
  if (!seed) return CURATED_DEVELOPER_PORTRAITS[0];
  let hash = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_DEVELOPER_PORTRAITS.length;
  return CURATED_DEVELOPER_PORTRAITS[index];
}

/**
 * Get human profile avatar
 * 1. If user has an actual uploaded photo (Cloudinary, custom URL) that is NOT a dicebear cartoon, return it.
 * 2. Otherwise, deterministically map to a high-quality human portrait.
 */
export function getDeveloperAvatar(user) {
  if (!user) return CURATED_DEVELOPER_PORTRAITS[0];

  const photo = user.photoUrl || user.photo;
  
  // If the user has an actual uploaded photo and it's not a cartoon avatar generator, use it!
  if (
    photo &&
    typeof photo === "string" &&
    photo.trim() !== "" &&
    !photo.includes("dicebear.com/9.x/avataaars") &&
    !photo.includes("dicebear.com/9.x/bottts")
  ) {
    return photo;
  }

  // Deterministically select a real human developer photo based on user ID or name
  const seed = user._id || user.id || user.emailId || user.firstName || "devnexus";
  return getDeterministicPortrait(seed);
}

/**
 * Get fallback initials for an avatar
 */
export function getDeveloperInitials(firstName = "", lastName = "") {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}` || "DN";
}
