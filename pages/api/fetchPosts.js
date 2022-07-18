export async function loadPosts() {
  // Call an external API endpoint to get posts
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${process.env.INSTAGRAM_API_KEY}`;
  const res = await fetch(url);
  const feed = await res.json();

  return feed;
}

export default async function handler(req, res) {
  // API logic
  const response = await loadPosts();
  res.json(response);
  res.json({ message: 'The response is ok!' });
}
