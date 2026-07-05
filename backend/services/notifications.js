/**
 * Discord Webhook Notification Service
 * Sends rich embed notifications to a Discord channel when new rooms are posted.
 * Includes room photos, details, amenities, and a direct link to the listing.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Sends a rich Discord embed notification for a newly listed room.
 * @param {Object} room - The room/property object with all details.
 */
export const sendRoomNotification = async (room) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL not set — skipping notification.");
    return;
  }

  // Build the room detail link
  const roomLink = `${FRONTEND_URL}/rooms/${room.id}`;

  // Truncate description to fit Discord embed limits (max 4096 chars)
  const description = room.description
    ? room.description.length > 300
      ? room.description.slice(0, 297) + "…"
      : room.description
    : "No description provided.";

  // Format amenities into a nice display
  const amenitiesDisplay =
    room.amenities && room.amenities.length > 0
      ? room.amenities.map((a) => `\`${a}\``).join("  ")
      : "_None listed_";

  // Format room type with capitalization
  const roomType = room.roomType
    ? room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)
    : "Room";

  // Format the available date nicely
  const availableFrom = room.availableFrom
    ? new Date(room.availableFrom).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  // Build the main embed
  const embed = {
    title: `🏠 ${room.title}`,
    url: roomLink,
    description: `${description}\n\n[**→ View Full Listing**](${roomLink})`,
    color: 0x06d6a0, // SthaanKhoj brand teal
    fields: [
      {
        name: "📍 Location",
        value: room.location || "N/A",
        inline: true,
      },
      {
        name: "💰 Rent",
        value: `**NPR ${Number(room.price).toLocaleString()}**/month`,
        inline: true,
      },
      {
        name: "🏷️ Type",
        value: roomType,
        inline: true,
      },
      {
        name: "📅 Available From",
        value: availableFrom,
        inline: true,
      },
      {
        name: "🛋️ Amenities",
        value: amenitiesDisplay,
        inline: false,
      },
    ],
    footer: {
      text: "SthaanKhoj — KU Room Finder",
    },
    timestamp: new Date().toISOString(),
  };

  // Set the first image as the main embed image (large preview)
  if (room.images && room.images.length > 0) {
    embed.image = { url: room.images[0] };
  }

  // Build the webhook payload
  const payload = {
    username: "SthaanKhoj",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/1946/1946488.png",
    content: "🔔 **New Room Just Listed!** Check it out 👇",
    embeds: [embed],
  };

  // If there are additional photos (2nd–5th), send them as separate embeds
  // Discord shows up to 4 additional embeds nicely
  if (room.images && room.images.length > 1) {
    const additionalEmbeds = room.images.slice(1, 5).map((url) => ({
      url: roomLink, // same URL groups them visually in Discord
      image: { url },
    }));
    payload.embeds.push(...additionalEmbeds);
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Discord webhook failed (${response.status}): ${errorText}`
    );
  }

  console.log(`✅ Discord notification sent for room: ${room.title}`);
};
