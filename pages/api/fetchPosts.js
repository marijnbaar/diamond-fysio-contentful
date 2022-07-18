export async function loadPosts() {
  // Call an external API endpoint to get posts
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${process.env.INSTAGRAM_API_KEY}`;
  const res = await fetch(url);
  const feed = await res.json();

  return feed;
}

//   import Cors from 'cors'

//   // Initializing the cors middleware
//   // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
//   const cors = Cors({
//     methods: ['POST', 'GET', 'HEAD'],
//   })

//   // Helper method to wait for a middleware to execute before continuing
//   // And to throw an error when an error happens in a middleware
//   function runMiddleware(req, res) {
//     return new Promise((resolve, reject) => {
//       fn((req, res,) => {
//         if (result instanceof Error) {
//           return reject(result)
//         }

//         return resolve(result)
//       })
//     })
//   }

export default async function handler(req, res) {
  // Run the middleware
  // await runMiddleware(req, res, cors)

  // Rest of the API logic
  // const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=IGQVJVSVRncy1IdF9PYjJjbWpobWJVWHVNX0Y3V1VkOTdBTHNIdHFfelZAvenVxbGVtbGhzZAW93TzB5QzJNRHlEeEpPbkt2eWJpM19ULVpRVHhRLV8yVDh0NlEzMml6TjlwWVJFaXZA4ZAXIxR2FjbFZAWRgZDZD`;
  const response = await loadPosts();
  res.json(response);
  res.json({ message: 'ok!' });
}
